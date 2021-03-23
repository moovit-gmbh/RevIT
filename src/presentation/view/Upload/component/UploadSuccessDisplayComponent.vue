<template>
    <div v-if="tilePos && job && token" :style="tileBackground">
          <v-img
              class="cursor-pointer"
              v-if="
                (!job.type || job.type === 'READY') &&
                job.tileURL &&
                job.tileURL.indexOf(job.id) > -1
              "
              style="margin: 0 auto"
              height="180px"
              :width="job.metadata.Width / job.tile.scaleFactor"
              :src="job.tileURL + '?jwt=' + token"
              :position="currentPreviewPos()"
              @mousemove="preview($event)"
              @error="imageLoadError()"
              @mouseleave="resetPreview()"
          >
            <template v-slot:placeholder>
              <v-row class="fill-height ma-0" align="center" justify="center">
                <v-skeleton-loader
                    class="mx-auto"
                    height="180px"
                    width="320px"
                    type="image"
                ></v-skeleton-loader>
              </v-row>
            </template>
            <v-row style="height: 180px">
              <v-slider
                  class="slider"
                  v-if="job.slider > 0"
                  :value="job.slider"
                  readonly
                  style="margin-top: 160px; opacity: 1 !important"
                  track-color="var(--slider-track)"
                  track-fill-color="var(--slider-track)"
                  thumb-color="var(--primary-background)"
                  :min="0"
                  :max="1"
                  :step="0.01"
              ></v-slider>
              <v-slider v-else style="opacity: 0" disabled></v-slider>
            </v-row>
          </v-img>
          <div
              v-else-if="
                (job.status && job.status === 'FAILED') ||
                (job.tileURL && job.tileURL.indexOf(job.id) === -1)
              "
          >
            <v-row style="height: 90px" :justify="'center'" :align="'end'">
              <v-icon color="red">warning</v-icon>
            </v-row>
            <v-row style="height: 90px" :justify="'center'" :align="'start'">
              <h2>Preview Offline</h2>
            </v-row>
          </div>
          <v-skeleton-loader
              v-else
              class="mx-auto"
              height="180px"
              width="320px"
              type="image"
          ></v-skeleton-loader>
        </div>
</template>

<script lang="ts">
import Component from "vue-class-component";
import {MyVue} from "@/MyVue";
import {Prop, Watch} from "vue-property-decorator";
import {Job} from "@/domain/Job/Job";
import Container from "@/Container";

@Component({})
export default class UploadSuccessDisplayComponent extends MyVue {
  name = "UploadSuccessDisplayComponent";

  constructor() {
    super();

    Container().getUserService().getToken$().subscribe(token => {
      this.token = token;
    });
  }

  job:Job | null = null;

  @Prop()
  jobObject!:Job;

  slider = 0;

  tilePos:{
    jobId: string,
    positionString: string,
  } | null = null;

  @Watch('jobObject')
  onJobObjectChanged(val: Job, oldVal: Job) {
    console.log("On changed fileName:");
    console.log(val);

    this.job = val;
    this.updateTileData();
  }

  token:string | null = null;

  created() {
    this.job = this.jobObject;
    this.updateTileData();
  }

  private updateTileData() {
    if (this.job === null) {
      throw new Error("this.job cannot be null here")
    }

    this.job.tileURL = Container().getConfigService().getRestAPIURL() + '/stream/thumbnail/' + this.job.id;

    this.tilePos = {
      jobId: this.job.id,
      positionString: this.initPosition(),
    };
  }

  tileBackground() {
    return (
        "background-image: url(" +
        require("@/assets/alphaChannelBackground.jpg") +
        "); height: 180px"
    );
  }

  imageLoadError(): void
  {
    if (this.job === null) {
      throw new Error("this.job cannot be null here")
    }

    this.job.tileURL = require("@/assets/serverOffline.png");
  }

  initPosition(): string
  {
    if (this.job === null) {
      throw new Error("this.job cannot be null here")
    }

    if (!this.job.tile || !this.job.metadata) {
      return "0px 100%";
    }
    if (!this.job.tile.numberOfFramesTile) {
      this.job.tile.numberOfFramesTile = 100;
    }

    const calcWidth = this.job.metadata.Width / this.job.tile.scaleFactor;
    return (
        -Math.floor(calcWidth / 2 / (calcWidth / this.job.tile.numberOfFramesTile)) *
        calcWidth +
        "px 100%"
    ); // its in the middle of the video rounded to previous frame
  }

  currentPreviewPos(): string
  {
    if (this.tilePos === null) {
      throw new Error("this.tilePos cannot be null here")
    }
    return this.tilePos.positionString;
  }

  preview(e:any): void
  {
    if (this.job === null) {
      throw new Error("this.job cannot be null here")
    }

    const calcWidth = this.job.metadata.Width / this.job.tile.scaleFactor;
    this.job.slider = e.layerX / calcWidth;

    if (this.tilePos === null) {
      throw new Error("this.tilePos cannot be undefined here")
    }

    // need image width and number of frames
    this.tilePos.positionString =
        -Math.floor(e.layerX / (calcWidth / this.job.tile.numberOfFramesTile)) *
        calcWidth +
        "px 100%";
  }

  resetPreview(): void
  {
    if (this.tilePos === null) {
      throw new Error("this.tilePos cannot be null here")
    }
    if (this.job === null) {
      throw new Error("this.job cannot be null here")
    }
    this.job.slider = 0;
    this.tilePos.positionString = this.initPosition();
  }
}
</script>

<style scoped lang="scss">
.wrapper {
  border: 1px solid red;
  width: 100%;
  height: 250px;
}
.moveImage {
  display: flex;
  justify-content: center;
}

div.controls {
  width: calc(100% + 24px);
  background: #3b3b3b;
  border-radius: 5px;
  padding-top: 0;
  margin-top: 3px;
}

.slider .v-slider--horizontal .v-slider__track-container {
  height: 8px !important;
}

.slider .v-slider__thumb {
  height: 20px !important;
  width: 8px !important;
  border-radius: 0% !important;
}

.v-slider__thumb-container {
  transition: none !important;
}
</style>
