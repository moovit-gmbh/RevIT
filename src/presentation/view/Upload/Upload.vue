<template>
  <v-container>
    <v-app-bar app color="#232323" dense dark height="40">
      <v-img src="@/assets/logo.png" max-width="40px" class="mr-3"></v-img>
      <v-toolbar-title>
        <span>
          <span>RevIT</span>
          <span style="color: var(--primary--text)"
                class="cursor-pointer"
                @click="selectNamespace()"
          >.{{ activeNamespaces }}</span
          >
        </span>
      </v-toolbar-title>

      <v-spacer></v-spacer>
      <span>{{ userData.email }}</span>
      <v-menu left bottom offset-y>
        <template v-slot:activator="{ on }">
          <v-btn icon v-on="on">
            <v-icon>mdi-dots-vertical</v-icon>
          </v-btn>
        </template>

        <v-list>
          <v-list-item>
            <v-list-item-title @click="logout" class="cursor-pointer"
              >Logout</v-list-item-title
            >
          </v-list-item>
        </v-list>
      </v-menu>
    </v-app-bar>

    <v-row dense style="min-width: 500px">
      <v-col cols="12">
        <v-card dark elevation="1">
          <v-card-title class="headline">
            Select file
          </v-card-title>

          <v-card-text>
            <SelectFileComponent
              v-bind:file.sync="inputFile"
              style="text-align: left;"
              @update-file="updateSelectedFile"
            />
          </v-card-text>

          <v-card-actions>
            <div
                class="progress-percentage"
                style="padding-left: 310px"
                v-if="ffmpegConvertStatus != null && ffmpegConvertStatus.progress > 0"
            >
              {{ ffmpegConvertStatus.progress }} %
            </div>
            <v-row align="center" justify="end" style="margin-right: 5px">
              <v-btn
                class="primary-btn"
                @click="handleJob"
                small
                :disabled="inputFile == null"
              >
                Create Job
              </v-btn>
            </v-row>
          </v-card-actions>
        </v-card>
      </v-col>

      <v-col cols="12">
        <v-card dark elevation="1" :disabled="jobId == null">
          <v-card-title class="headline">
            Add Public Link
          </v-card-title>

          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              icon
              dark
              @click="showExternalEmailComponent = !showExternalEmailComponent"
            >
              <v-icon dark>{{
                showExternalEmailComponent
                  ? "mdi-chevron-up"
                  : "mdi-chevron-down"
              }}</v-icon>
            </v-btn>
          </v-card-actions>

          <v-expand-transition>
            <div v-show="showExternalEmailComponent">
              <v-divider></v-divider>

              <v-card-text>
                <SelectExternalEmailsComponent v-bind:job-id="jobId" />
              </v-card-text>
            </div>
          </v-expand-transition>
        </v-card>
      </v-col>

      <v-col cols="12">
        <v-card dark elevation="1" :disabled="jobId == null">
          <v-card-title class="headline">
            Select Groups
          </v-card-title>

          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              icon
              dark
              @click="showGroupsComponent = !showGroupsComponent"
            >
              <v-icon dark>{{
                showGroupsComponent ? "mdi-chevron-up" : "mdi-chevron-down"
              }}</v-icon>
            </v-btn>
          </v-card-actions>

          <v-expand-transition>
            <div v-show="showGroupsComponent">
              <v-divider></v-divider>

              <v-card-text>
                <SelectGroupsComponent v-bind:job-id="jobId" />
              </v-card-text>
            </div>
          </v-expand-transition>
        </v-card>
      </v-col>

      <v-col cols="12">
        <v-card
          class="mb-12"
          min-height="150px"
          max-height="200px;"
          style="text-align: left;"
        >
          <v-card-title class="headline">
            Upload
          </v-card-title>

          <div v-if="ffmpegConvertStatus === null">
            <v-card-subtitle>No file has been selected</v-card-subtitle>
          </div>
          <div v-else-if="!ffmpegConvertStatus.isFinished">
            <v-card-subtitle
              >Minimizing of the video is still running... (this could take a
              long time depending on the video size)<br />
              Once this is finished you can start the upload.
            </v-card-subtitle>
            <!--
            // todo: implement ffmpegConvertStatus.progress
            <div class="progress-percentage">
              {{ffmpegConvertStatus.progress}} %
            </div>
            -->
            <!--            <v-btn color="primary-btn" class="mb-6" disabled style="float: right; margin-right: 14px">Start upload</v-btn>-->
          </div>
          <div
            v-else-if="
              ffmpegConvertStatus.isFinished &&
                ffmpegConvertStatus.exitCode !== 0
            "
          >
            <v-card-subtitle
              >Minimizing of the video failed! <br />
              Please go back to the file selection and try again. <br />
              If it fails again, try selecting a different video. <br />
              In case of permanent error contact MoovIT GmbH.
            </v-card-subtitle>
            <!--            <v-btn color="primary-btn" class="mb-6" disabled style="float: right; margin-right: 14px">Start upload</v-btn>-->
          </div>
          <div v-else>
            <v-card-subtitle v-if="latestUploadStatus === null"
              >To finish this upload press the "Start upload"
              button.</v-card-subtitle
            >
            <v-btn
              v-if="latestUploadStatus === null"
              @click="startUpload()"
              color="primary-btn"
              style="float: right; margin-right: 14px"
              >Start upload</v-btn
            >
            <div v-else>
              <v-card-subtitle v-if="!latestUploadStatus.isFinished"
                >The file is being uploaded now.</v-card-subtitle
              >
<!--              <UploadProgressComponent-->
<!--                v-bind:file-name="inputFile.name"-->
<!--                v-bind:progress="latestUploadStatus.progress"-->
<!--              />-->
              <div
                class="progress-percentage"
                v-if="!latestUploadStatus.isFinished"
              >
                {{ latestUploadStatus.progress }} %
              </div>
              <div
                class="mt-3"
                v-if="
                  latestUploadStatus.isFinished &&
                    latestUploadStatus.failed === false
                "
              >
                <v-card-subtitle class="success-text"
                  >Congratulations, the upload was successful. <br />
                  Here is the result:
                </v-card-subtitle>
                <UploadSuccessDisplayComponent
                  v-bind:job-object="latestUploadStatus.result"
                />
                <v-card-subtitle class="mt-5 pb-5"
                  >You can now finish this dialog by clicking the finish button
                  below.</v-card-subtitle
                >

                <div
                  style="width: 100%; height: 38px; display: flex; justify-content: flex-end"
                >
                  <v-btn
                    color="primary-btn"
                    style="margin-right: 14px; margin-bottom: 8px"
                    rounded
                    small
                    @click="finishProcess()"
                  >
                    Finish
                  </v-btn>
                </div>
              </div>
              <div
                v-if="
                  latestUploadStatus.isFinished &&
                    latestUploadStatus.failed === true
                "
                class="mt-3"
              >
                <v-card-subtitle class="error--text"
                  >The upload failed.</v-card-subtitle
                >
                <v-card-subtitle v-if="latestUploadStatus.errorMessage"
                  >The error message was:
                  {{ latestUploadStatus.errorMessage }}</v-card-subtitle
                >
                <v-card-subtitle
                  >Please retry uploading or select a different file. <br />
                  If this error persists, than please contact the customer
                  service.
                </v-card-subtitle>
                <div
                  style="width: 100%; height: 38px; display: flex; justify-content: flex-end"
                >
                  <v-btn
                    @click="startUpload()"
                    class="mb-6"
                    color="primary-btn"
                    style="float: right; margin-right: 14px"
                    >Retry upload</v-btn
                  >
                </div>
              </div>
            </div>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <SelectNamespaceDialogComponent :dialog="selectNamespaceDialog" @close-namespace-dialog="selectNamespaceDialog = false"></SelectNamespaceDialogComponent>
  </v-container>



  <!--  <v-stepper v-model="e1">-->
  <!--    <v-stepper-header>-->
  <!--      <v-stepper-step-->
  <!--          :complete="e1 > 1"-->
  <!--          step="1"-->
  <!--          color="var(&#45;&#45;primary)"-->
  <!--      >-->
  <!--        Select file-->
  <!--      </v-stepper-step>-->

  <!--      <v-divider></v-divider>-->

  <!--      <v-stepper-step-->
  <!--          :complete="e1 > 2"-->
  <!--          step="2"-->
  <!--          color="var(&#45;&#45;primary)"-->
  <!--      >-->
  <!--        Select external emails-->
  <!--      </v-stepper-step>-->

  <!--      <v-divider></v-divider>-->

  <!--      <v-stepper-step-->
  <!--          :complete="e1 > 3"-->
  <!--          step="3"-->
  <!--          color="var(&#45;&#45;primary)"-->
  <!--      >-->
  <!--        Select groups-->
  <!--      </v-stepper-step>-->

  <!--      <v-divider></v-divider>-->

  <!--      <v-stepper-step-->
  <!--          :complete="e1 > 4"-->
  <!--          step="4"-->
  <!--          color="var(&#45;&#45;primary)"-->
  <!--      >-->
  <!--        Select users-->
  <!--      </v-stepper-step>-->

  <!--      <v-divider></v-divider>-->

  <!--      <v-stepper-step step="5" color="var(&#45;&#45;primary)">-->
  <!--        Upload-->
  <!--      </v-stepper-step>-->
  <!--    </v-stepper-header>-->

  <!--    <v-stepper-items>-->
  <!--      <v-stepper-content step="1">-->
  <!--        <v-card-->
  <!--            class="mb-12"-->
  <!--            min-height="200px"-->
  <!--        >-->
  <!--          <SelectFileComponent v-bind:file.sync="inputFile"-->
  <!--                               @update-file="updateSelectedFile"-->
  <!--          />-->
  <!--        </v-card>-->
  <!--        <v-btn-->
  <!--            color="primary-btn"-->
  <!--            :disabled="inputFile === null"-->
  <!--            @click="e1 = 2"-->
  <!--        >-->
  <!--          Next-->
  <!--        </v-btn>-->
  <!--      </v-stepper-content>-->

  <!--      <v-stepper-content step="2">-->
  <!--        <v-card-->
  <!--            class="mb-12"-->
  <!--            min-height="200px"-->
  <!--        >-->
  <!--          <SelectExternalEmailsComponent v-bind:job-id="jobId" />-->
  <!--          <br>-->
  <!--        </v-card>-->

  <!--        <v-btn-->
  <!--            color="primary-btn"-->
  <!--            @click="e1 = 3"-->
  <!--        >-->
  <!--          Next-->
  <!--        </v-btn>-->

  <!--        <v-btn color="primary-btn" @click="e1 = 1">-->
  <!--          Back-->
  <!--        </v-btn>-->
  <!--      </v-stepper-content>-->

  <!--      <v-stepper-content step="3">-->
  <!--        <v-card-->
  <!--            class="mb-12"-->
  <!--            min-height="200px"-->
  <!--        >-->
  <!--          <SelectGroupsComponent v-bind:job-id="jobId" />-->
  <!--          <br>-->
  <!--        </v-card>-->

  <!--        <v-btn-->
  <!--            color="primary-btn"-->
  <!--            @click="e1 = 4"-->
  <!--        >-->
  <!--          Next-->
  <!--        </v-btn>-->

  <!--        <v-btn color="primary-btn" @click="e1 = 2">-->
  <!--          Back-->
  <!--        </v-btn>-->
  <!--      </v-stepper-content>-->

  <!--      <v-stepper-content step="4">-->
  <!--        <v-card-->
  <!--            class="mb-12"-->
  <!--            min-height="200px"-->
  <!--        >-->
  <!--          <SelectUsersComponent v-bind:job-id="jobId" />-->
  <!--          <br>-->
  <!--        </v-card>-->

  <!--        <v-btn-->
  <!--            color="primary-btn"-->
  <!--            @click="e1 = 5"-->
  <!--        >-->
  <!--          Next-->
  <!--        </v-btn>-->

  <!--        <v-btn color="primary-btn" @click="e1 = 3">-->
  <!--          Back-->
  <!--        </v-btn>-->
  <!--      </v-stepper-content>-->

  <!--      <v-stepper-content step="5">-->
  <!--        <v-card-->
  <!--            class="mb-12"-->
  <!--            min-height="200px"-->
  <!--        >-->
  <!--          <h1>Upload</h1>-->

  <!--          <div v-if="ffmpegConvertStatus === null">-->
  <!--            Error: ffmpegConvertStatus cannot be null on this page (it means no file has been selected)-->
  <!--          </div>-->
  <!--          <div v-else-if="!ffmpegConvertStatus.isFinished">-->
  <!--            <p>Minimizing of the video is still running... (this could take a long time depending on the video size)</p>-->
  <!--            &lt;!&ndash;-->
  <!--            // todo: implement ffmpegConvertStatus.progress-->
  <!--            <div class="progress-percentage">-->
  <!--              {{ffmpegConvertStatus.progress}} %-->
  <!--            </div>-->
  <!--            &ndash;&gt;-->
  <!--            <p>Once this is finished you can start the upload.</p>-->
  <!--            <v-btn color="primary-btn" class="mb-6" disabled>Start upload</v-btn>-->
  <!--          </div>-->
  <!--          <div v-else-if="ffmpegConvertStatus.isFinished && ffmpegConvertStatus.exitCode !== 0">-->
  <!--            <p>Minimizing of the video failed!</p>-->
  <!--            <p>Please go back to the file selection and try again.</p>-->
  <!--            <p>If it fails again, try selecting a different video.</p>-->
  <!--            <p>In case of permanent error contact MoovIT GmbH.</p>-->
  <!--            <v-btn color="primary-btn" class="mb-6" disabled>Start upload</v-btn>-->
  <!--          </div>-->
  <!--          <div v-else>-->
  <!--            <p v-if="latestUploadStatus === null">To finish this upload press the "Start upload" button.</p>-->
  <!--            <v-btn v-if="latestUploadStatus === null" @click="startUpload()" color="primary-btn">Start upload</v-btn>-->
  <!--            <div v-else>-->
  <!--              <p v-if="!latestUploadStatus.isFinished">The file is being uploaded now.</p>-->
  <!--              <UploadProgressComponent v-bind:file-name="inputFile.name" v-bind:progress="latestUploadStatus.progress" />-->
  <!--              <div class="progress-percentage" v-if="!latestUploadStatus.isFinished">-->
  <!--                {{latestUploadStatus.progress}} %-->
  <!--              </div>-->
  <!--              <div class="mt-3" v-if="latestUploadStatus.isFinished && latestUploadStatus.failed === false">-->
  <!--                <p class="success-text">Congratulations, the upload was successful.</p>-->
  <!--                <p>Here is the result:</p>-->
  <!--                <UploadSuccessDisplayComponent v-bind:job-object="latestUploadStatus.result" />-->
  <!--                <p class="mt-5 pb-5">You can now finish this dialog by clicking the finish button below.</p>-->
  <!--              </div>-->
  <!--              <div v-if="latestUploadStatus.isFinished && latestUploadStatus.failed === true" class="mt-3">-->
  <!--                <p class="error&#45;&#45;text">The upload failed.</p>-->
  <!--                <p v-if="latestUploadStatus.errorMessage">The error message was: {{latestUploadStatus.errorMessage}}</p>-->
  <!--                <p>Please retry uploading or select a different file.</p>-->
  <!--                <p>If this error persists, than please contact the customer service.</p>-->
  <!--                <v-btn @click="startUpload()" class="mb-6" color="primary-btn">Retry upload</v-btn>-->
  <!--              </div>-->
  <!--            </div>-->
  <!--          </div>-->

  <!--        </v-card>-->

  <!--        <v-btn-->
  <!--            color="primary-btn"-->
  <!--            :disabled="!latestUploadStatus || !latestUploadStatus.isFinished || latestUploadStatus.failed === true"-->
  <!--            @click="finishProcess()"-->
  <!--        >-->
  <!--          Finish-->
  <!--        </v-btn>-->

  <!--        <v-btn color="primary-btn" v-if="!latestUploadStatus || !latestUploadStatus.isFinished || latestUploadStatus.failed === true" @click="e1 = 4">-->
  <!--          Back-->
  <!--        </v-btn>-->
  <!--      </v-stepper-content>-->
  <!--    </v-stepper-items>-->
  <!--  </v-stepper>-->
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
