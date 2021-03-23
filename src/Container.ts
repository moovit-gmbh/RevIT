// API classes
import { UserApi } from "@/api/User/UserApi";
import { NamespaceApi } from "@/api/Namespace/NamespaceApi";
import { JobApi } from "@/api/Job/JobApi";
import { TokenApi } from "@/api/Token/TokenApi";
import { GroupApi } from "@/api/Group/GroupApi";

// Service classes
import { ErrorService } from "@/domain/ErrorService";
import { ConfigService } from "@/domain/ConfigService";
import { UserService } from "@/domain/User/UserService";
import { NamespaceService } from "@/domain/NamespaceService";
import { JobService } from "@/domain/Job/JobService";
import { TokenService } from "@/domain/Token/TokenService";
import { GroupService } from "@/domain/Group/GroupService";
import { FFmpegService } from "@/domain/FFmpeg/FFmpegService";

class ContainerStatic {

  // API classes
  private namespaceApi: NamespaceApi | undefined;
  private userApi: UserApi | undefined;
  private jobApi: JobApi | undefined;
  private tokenApi: TokenApi | undefined;
  private groupApi: GroupApi | undefined;

  // Service classes
  private errorService: ErrorService | undefined;
  private configService: ConfigService | undefined;
  private userService: UserService | undefined;
  private namespaceService: NamespaceService | undefined;
  private jobService: JobService | undefined;
  private tokenService: TokenService | undefined;
  private groupService: GroupService | undefined;
  private ffmpegService: FFmpegService | undefined;

  private getUserApi(): UserApi {
    if (this.userApi === undefined) {
      this.userApi = new UserApi(this.getErrorService(), this.getConfigService());
    }
    return this.userApi;
  }

  private getNamespaceApi(): NamespaceApi {
    if (this.namespaceApi === undefined) {
      this.namespaceApi = new NamespaceApi(this.getErrorService(), this.getConfigService(), this.getUserService());
    }
    return this.namespaceApi;
  }

  private getJobApi(): JobApi {
    if (this.jobApi === undefined) {
      this.jobApi = new JobApi(this.getErrorService(), this.getConfigService(), this.getUserService());
    }
    return this.jobApi;
  }

  private getTokenApi(): TokenApi {
    if (this.tokenApi === undefined) {
      this.tokenApi = new TokenApi(this.getErrorService(), this.getConfigService(), this.getUserService());
    }
    return this.tokenApi;
  }

  private getGroupApi(): GroupApi {
    if (this.groupApi === undefined) {
      this.groupApi = new GroupApi(this.getErrorService(), this.getConfigService(), this.getUserService());
    }
    return this.groupApi;
  }

  public getErrorService(): ErrorService {
    if (this.errorService === undefined) {
      this.errorService = new ErrorService();
    }
    return this.errorService;
  }

  public getConfigService(): ConfigService {
    if (this.configService === undefined) {
      this.configService = new ConfigService();
    }
    return this.configService;
  }

  public getUserService(): UserService {
    if (this.userService === undefined) {
      this.userService = new UserService(
          this.getErrorService(),
          this.getUserApi()
      );
    }
    return this.userService;
  }

  public getNamespaceService(): NamespaceService {
    if (this.namespaceService === undefined) {
      this.namespaceService = new NamespaceService(
          this.getErrorService(),
          this.getNamespaceApi()
      );
    }
    return this.namespaceService;
  }

  public getJobService(): JobService {
    if (this.jobService === undefined) {
      this.jobService = new JobService(
          this.getErrorService(),
          this.getJobApi()
      );
    }
    return this.jobService;
  }

  public getTokenService(): TokenService {
    if (this.tokenService === undefined) {
      this.tokenService = new TokenService(
          this.getErrorService(),
          this.getTokenApi(),
          this.getJobApi()
      );
    }
    return this.tokenService;
  }

  public getGroupService(): GroupService {
    if (this.groupService === undefined) {
      this.groupService = new GroupService(
          this.getErrorService(),
          this.getGroupApi(),
          this.getJobApi()
      );
    }
    return this.groupService;
  }

  public getFFmpegService(): FFmpegService {
    if (this.ffmpegService === undefined) {
      this.ffmpegService = new FFmpegService(
          this.getErrorService()
      );
    }
    return this.ffmpegService;
  }

}

const containerStatic = new ContainerStatic();
const Container = () => containerStatic;
export default Container;
