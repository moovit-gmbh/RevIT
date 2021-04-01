<template>
  <v-stepper v-model="e1">
    <v-stepper-header>
      <v-stepper-step
          :complete="e1 > 1"
          step="1"
          color="var(--primary)"
      >
        Select file
      </v-stepper-step>

      <v-divider></v-divider>

      <v-stepper-step
          :complete="e1 > 2"
          step="2"
          color="var(--primary)"
      >
        Select external emails
      </v-stepper-step>

      <v-divider></v-divider>

      <v-stepper-step
          :complete="e1 > 3"
          step="3"
          color="var(--primary)"
      >
        Select groups
      </v-stepper-step>

      <v-divider></v-divider>

      <v-stepper-step
          :complete="e1 > 4"
          step="4"
          color="var(--primary)"
      >
        Select users
      </v-stepper-step>

      <v-divider></v-divider>

      <v-stepper-step step="5" color="var(--primary)">
        Upload
      </v-stepper-step>
    </v-stepper-header>

    <v-stepper-items>
      <v-stepper-content step="1">
        <v-card
            class="mb-12"
            min-height="200px"
        >
          <SelectFileComponent v-bind:file.sync="inputFile"
                               @update-file="updateSelectedFile"
          />
        </v-card>
        <v-btn
            color="primary-btn"
            :disabled="inputFile === null"
            @click="e1 = 2"
        >
          Next
        </v-btn>
      </v-stepper-content>

      <v-stepper-content step="2">
        <v-card
            class="mb-12"
            min-height="200px"
        >
          <SelectExternalEmailsComponent v-bind:job-id="jobId" />
          <br>
        </v-card>

        <v-btn
            color="primary-btn"
            @click="e1 = 3"
        >
          Next
        </v-btn>

        <v-btn color="primary-btn" @click="e1 = 1">
          Back
        </v-btn>
      </v-stepper-content>

      <v-stepper-content step="3">
        <v-card
            class="mb-12"
            min-height="200px"
        >
          <SelectGroupsComponent v-bind:job-id="jobId" />
          <br>
        </v-card>

        <v-btn
            color="primary-btn"
            @click="e1 = 4"
        >
          Next
        </v-btn>

        <v-btn color="primary-btn" @click="e1 = 2">
          Back
        </v-btn>
      </v-stepper-content>

      <v-stepper-content step="4">
        <v-card
            class="mb-12"
            min-height="200px"
        >
          <SelectUsersComponent v-bind:job-id="jobId" />
          <br>
        </v-card>

        <v-btn
            color="primary-btn"
            @click="e1 = 5"
        >
          Next
        </v-btn>

        <v-btn color="primary-btn" @click="e1 = 3">
          Back
        </v-btn>
      </v-stepper-content>

      <v-stepper-content step="5">
        <v-card
            class="mb-12"
            min-height="200px"
        >
          <h1>Upload</h1>

          <div v-if="ffmpegConvertStatus === null">
            Error: ffmpegConvertStatus cannot be null on this page (it means no file has been selected)
          </div>
          <div v-else-if="!ffmpegConvertStatus.isFinished">
            <p>Minimizing of the video is still running... (this could take a long time depending on the video size)</p>
            <!--
            // todo: implement ffmpegConvertStatus.progress
            <div class="progress-percentage">
              {{ffmpegConvertStatus.progress}} %
            </div>
            -->
            <p>Once this is finished you can start the upload.</p>
            <v-btn color="primary-btn" class="mb-6" disabled>Start upload</v-btn>
          </div>
          <div v-else-if="ffmpegConvertStatus.isFinished && ffmpegConvertStatus.exitCode !== 0">
            <p>Minimizing of the video failed!</p>
            <p>Please go back to the file selection and try again.</p>
            <p>If it fails again, try selecting a different video.</p>
            <p>In case of permanent error contact MoovIT GmbH.</p>
            <v-btn color="primary-btn" class="mb-6" disabled>Start upload</v-btn>
          </div>
          <div v-else>
            <p v-if="latestUploadStatus === null">To finish this upload press the "Start upload" button.</p>
            <v-btn v-if="latestUploadStatus === null" @click="startUpload()" color="primary-btn">Start upload</v-btn>
            <div v-else>
              <p v-if="!latestUploadStatus.isFinished">The file is being uploaded now.</p>
              <UploadProgressComponent v-bind:file-name="inputFile.name" v-bind:progress="latestUploadStatus.progress" />
              <div class="progress-percentage" v-if="!latestUploadStatus.isFinished">
                {{latestUploadStatus.progress}} %
              </div>
              <div class="mt-3" v-if="latestUploadStatus.isFinished && latestUploadStatus.failed === false">
                <p class="success-text">Congratulations, the upload was successful.</p>
                <p>Here is the result:</p>
                <UploadSuccessDisplayComponent v-bind:job-object="latestUploadStatus.result" />
                <p class="mt-5 pb-5">You can now finish this dialog by clicking the finish button below.</p>
              </div>
              <div v-if="latestUploadStatus.isFinished && latestUploadStatus.failed === true" class="mt-3">
                <p class="error--text">The upload failed.</p>
                <p v-if="latestUploadStatus.errorMessage">The error message was: {{latestUploadStatus.errorMessage}}</p>
                <p>Please retry uploading or select a different file.</p>
                <p>If this error persists, than please contact the customer service.</p>
                <v-btn @click="startUpload()" class="mb-6" color="primary-btn">Retry upload</v-btn>
              </div>
            </div>
          </div>

        </v-card>

        <v-btn
            color="primary-btn"
            :disabled="!latestUploadStatus || !latestUploadStatus.isFinished || latestUploadStatus.failed === true"
            @click="finishProcess()"
        >
          Finish
        </v-btn>

        <v-btn color="primary-btn" v-if="!latestUploadStatus || !latestUploadStatus.isFinished || latestUploadStatus.failed === true" @click="e1 = 4">
          Back
        </v-btn>
      </v-stepper-content>
    </v-stepper-items>
  </v-stepper>

</template>
<script lang="ts" src="./Upload.ts"></script>
<style lang="scss" scoped>
@import "src/presentation/view/Upload/Upload";

.success-text {
  color: green;
}

.progress-percentage {
  text-align: center;
  font-size: 140%;
  padding: 10px;
}

</style>
