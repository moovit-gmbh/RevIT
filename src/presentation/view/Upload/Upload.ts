import Component from "vue-class-component";
import { MyVue } from "@/MyVue";
import Container from "@/Container";
import { UploadStatus } from "@/api/Job/UploadStatus";
import SelectFileComponent from "@/presentation/view/Upload/component/SelectFileComponent.vue";
import SelectExternalEmailsComponent from "@/presentation/view/Upload/component/ExternalEmail/SelectExternalEmailsComponent.vue";
import SelectGroupsComponent from "@/presentation/view/Upload/component/Group/SelectGroupsComponent.vue";
import SelectUsersComponent from "@/presentation/view/Upload/component/User/SelectUsersComponent.vue";
import UploadProgressComponent from "@/presentation/view/Upload/component/UploadProgressComponent.vue";
import UploadSuccessDisplayComponent from "@/presentation/view/Upload/component/UploadSuccessDisplayComponent.vue";
import { FFmpegConvertStatus } from "@/domain/FFmpeg/FFmpegConvertStatus";
import { UserData } from "@/domain/User/UserData";
import SelectNamespaceDialogComponent from "@/presentation/view/Upload/component/SelectNamespaceDialogComponent.vue";

@Component({
  components: {
    SelectExternalEmailsComponent,
    SelectFileComponent,
    SelectGroupsComponent,
    SelectUsersComponent,
    UploadProgressComponent,
    UploadSuccessDisplayComponent,
    SelectNamespaceDialogComponent
  }
})
export default class Upload extends MyVue {
  name = "Upload";

  selectNamespaceDialog = false;

  showExternalEmailComponent = false;
  showGroupsComponent = false;

  e1 = 1;

  userData: UserData | null = null;
  namespace = "";
  jobId: string | null = null;

  inputFile: File | null = null;
  ffmpegConvertStatus: FFmpegConvertStatus | null = null;
  latestUploadStatus: UploadStatus | null = null;

  created() {
    // keep this method. otherwise the @update-file="updateSelectedFile" wont work anymore
  }

  constructor() {
    super();
    Container()
      .getJobService()
      .removeUnfinishedJobs();

    Container()
      .getUserService()
      .getUserData$()
      .subscribe(user => {
        this.userData = user;
        this.namespace = user.activeNamespace;
        this.changeActiveNamespace(user.activeNamespace);
        this.deleteUnfinishedJob();
      });
  }

  deleteUnfinishedJob() {
    if (this.jobId != null && this.latestUploadStatus == null) {
      Container()
        .getJobService()
        .removeUnfinishedJobs();
      this.finishProcess();
    }
  }
  changeActiveNamespace(activeNamespace: string) {
    this.namespace = activeNamespace;
  }

  get activeNamespaces(): string {
    return this.namespace;
  }

  private selectNamespace() {
      this.selectNamespaceDialog = true;
  }

  private updateSelectedFile(file: File | null) {
    console.log("Received new file:");
    console.log(file);

    this.inputFile = file;

    // const jobName = file?.name ?? "undefined";
    // if(this.jobId == null) {
    //   console.log("Adding job..");
    //   this.addJob(jobName);
    // } else {
    //   console.log("Updating job name..");
    //   this.updateJobName(jobName);
    // }

    console.log("file:");
    console.log(file);

    if (file !== null && file !== undefined) {
      console.log("File given.. Converting file now");
      this.convertFile(file);
    }
  }

  private updateJobName(jobName: string) {
    Container()
      .getJobService()
      .updateJobName(jobName)
      .subscribe(job => {
        if (job === undefined) {
          Container()
            .getErrorService()
            .setError("Failed to update job name");
          console.error("Failed to update job name");
        } else {
          console.log("Updated job name successfully");
        }
      });
  }

  private convertFile(file: File): void {
    let hasErrorBeenKnown = false;
    Container()
      .getFFmpegService()
      .convertVideoFile(file.path)
      .subscribe(ffmpegConvertStatus => {
        this.ffmpegConvertStatus = ffmpegConvertStatus;

        console.log("from upload: " + ffmpegConvertStatus.progress + "%")
        if (
          ffmpegConvertStatus.isFinished &&
          ffmpegConvertStatus.exitCode != 0 &&
          !hasErrorBeenKnown
        ) {
          hasErrorBeenKnown = true; // enter this if only one time
          Container()
            .getErrorService()
            .setError('Minimization of file "' + file.name + '" failed!');
          console.error(
            'ffmpeg exited with code "' + ffmpegConvertStatus.exitCode + '"'
          );
        }
      });
  }

  private handleJob() {
    const jobName = this.inputFile?.name ?? "undefined";
    if (this.jobId == null) {
      console.log("Adding job..");
      this.addJob(jobName);
    } else {
      console.log("Updating job name..");
      this.updateJobName(jobName);
    }
  }

  private addJob(jobName: string) {
    Container()
      .getJobService()
      .addJob(jobName)
      .subscribe(job => {
        if (job === undefined) {
          Container()
            .getErrorService()
            .setError("Server answered with error: Failed to add job");
          console.error("Failed to add job");
          this.jobId = null;
        } else {
          console.log("Added job successfully");
          this.jobId = job.id;
        }
      });
  }

  startUpload() {
    if (this.ffmpegConvertStatus == null) {
      Container()
        .getErrorService()
        .setError("Failed to start upload because of an internal error");
      throw new Error("this.ffmpegConvertStatus cannot be null here");
    }
    if (!this.ffmpegConvertStatus.isFinished) {
      Container()
        .getErrorService()
        .setError("Failed to start upload because of an internal error");
      throw new Error(
        "this.ffmpegConvertStatus.isFinished cannot be false here"
      );
    }

    // todo: this is not ideal as it loads the file into ram. Find better solution (streaming)!
    const outputFile = this.createFileObject(
      this.ffmpegConvertStatus.outputFilePath
    );

    let hasErrorBeenKnown = false;
    Container()
      .getJobService()
      .uploadJob(outputFile)
      .subscribe(uploadStatus => {
        this.latestUploadStatus = uploadStatus;
        if (uploadStatus.failed && !hasErrorBeenKnown) {
          hasErrorBeenKnown = true; // enter this if only one time
          Container()
            .getErrorService()
            .setError('Uploading file "' + this.inputFile?.name + '" failed!');
        }
      });
  }

  private createFileObject(filePath: string): File {
    const buffer = require("fs").readFileSync(filePath);
    const arrayBuffer = buffer.slice(
      buffer.byteOffset,
      buffer.byteOffset + buffer.byteLength
    );
    return new File([arrayBuffer], require("path").basename(filePath), {
      type: require("mime-types").lookup(
        require("path").extname(filePath) || undefined
      )
    });
  }

  finishProcess() {
    this.inputFile = null;
    Container()
      .getJobService()
      .finishJob();
    this.latestUploadStatus = null;
    this.ffmpegConvertStatus = null;
    this.jobId = null;
    this.e1 = 1;
    // this.$router.push('/');
  }

  logout() {
    console.log("logged out");
    Container()
      .getUserService()
      .logout();
  }
}
