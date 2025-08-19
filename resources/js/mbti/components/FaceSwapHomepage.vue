<template>
  <div
    layer-name="換臉_首頁"
    class="relative mx-auto my-0 bg-zinc-800 h-[774px] w-[375px] max-md:w-full max-md:max-w-screen-md max-sm:w-full max-sm:h-auto max-sm:min-h-[774px]"
    data-name="換臉_首頁"
  >
    <div
      class="absolute top-0 left-0 shrink-0 h-20 bg-zinc-800 w-[375px] max-md:w-full"
    ></div>
    <div
      class="flex absolute top-0 left-0 shrink-0 gap-5 justify-center items-center p-5 h-20 w-[375px] max-md:w-full max-sm:p-4 max-sm:h-[70px]"
    >
      <div
        layer-name="AI換臉"
        class="relative text-xl font-bold text-orange-200 max-sm:text-lg"
        data-name="AI換臉"
      >
        <div class="text-xl font-bold text-orange-200 max-sm:text-lg">
          AI換臉
        </div>
      </div>
    </div>
    <div
      class="absolute shrink-0 h-[397px] left-[47px] top-[90px] w-[297px] max-md:left-2/4 max-md:-translate-x-2/4 max-sm:top-20 max-sm:left-2/4 max-sm:-translate-x-2/4 max-sm:h-[335px] max-sm:w-[250px]"
    >
      <div>
        <div>
          <svg id="135:309" width="232" height="232" viewBox="0 0 232 232" fill="none" xmlns="http://www.w3.org/2000/svg" class="circle-border" style="width: 231px; height: 231px; flex-shrink: 0; stroke-width: 0.731px; stroke: #EBD8B2; position: absolute; left: 27px; top: 90px">
            <path d="M116.108 0.84201C179.725 0.842031 231.296 52.4144 231.296 116.031C231.296 179.648 179.725 231.22 116.108 231.22C52.4906 231.22 0.918271 179.648 0.918213 116.031C0.918213 52.4144 52.4906 0.84201 116.108 0.84201Z" stroke="#EBD8B2" stroke-width="0.731358"></path>
          </svg>
        </div>
      </div>
      <img
        src="https://api.builder.io/api/v1/image/assets/TEMP/dfe66e0cb607ee0d00794b4042bfd005ce2d8418?width=594"
        alt=""
        class="absolute top-0 left-0 shrink-0 aspect-[110/147] h-[397px] w-[297px] max-sm:h-[335px] max-sm:w-[250px]"
        data-name="S__205619331 1"
      />
    </div>
    <div
      class="absolute left-0 shrink-0 w-52 h-2.5 -rotate-90 top-[229px] max-md:left-[-50px] max-sm:-left-20 max-sm:top-[200px]"
    ></div>
    <div
      class="absolute top-28 shrink-0 w-52 h-2.5 -rotate-90 left-[365px] max-md:left-auto max-md:right-[-50px] max-sm:-right-20 max-sm:left-auto max-sm:top-[150px]"
    ></div>
    <div
      class="flex absolute left-11 shrink-0 gap-5 justify-center items-center px-20 py-3 h-11 bg-orange-200 rounded-md cursor-pointer top-[623px] w-[300px] max-md:left-2/4 max-md:-translate-x-2/4 max-sm:left-2/4 max-sm:px-5 max-sm:py-3 max-sm:-translate-x-2/4 max-sm:top-[550px] max-sm:w-[280px]"
      @click="enterFaceSwap"
    >
      <div
        layer-name="進入IP換臉生成工具"
        class="relative shrink-0 w-36 text-base font-bold text-zinc-800 max-sm:w-auto max-sm:text-sm"
        data-name="進入IP換臉生成工具"
      >
        <div class="text-base font-bold text-zinc-800 max-sm:text-sm">
          進入IP換臉生成工具
        </div>
      </div>
    </div>
    <div
      layer-name="此服務由 創造智能 提供技術支持"
      class="absolute h-3.5 text-xs text-center text-orange-200 left-[102px] top-[716px] w-[174px] max-md:left-2/4 max-md:w-auto max-md:-translate-x-2/4 max-sm:left-2/4 max-sm:text-xs max-sm:-translate-x-2/4 max-sm:top-[620px]"
      data-name="此服務由 創造智能 提供技術支持"
    >
      <div class="text-xs text-orange-200 max-sm:text-xs">
        此服務由 創造智能 提供技術支持
      </div>
    </div>
    <div
      class="flex absolute flex-col gap-4 items-center h-[102px] left-[38px] top-[491px] w-[315px] max-md:left-2/4 max-md:-translate-x-2/4 max-sm:left-2/4 max-sm:-translate-x-2/4 max-sm:top-[430px] max-sm:w-[280px]"
    >
      <div
        layer-name="將你的照片打造成熱門IP！"
        class="relative self-stretch text-2xl font-bold text-center text-orange-200 max-sm:text-xl"
        data-name="將你的照片打造成熱門IP！"
      >
        <div class="text-2xl font-bold text-orange-200 max-sm:text-xl">
          將你的照片打造成熱門IP！
        </div>
      </div>
      <div
        layer-name="三步驟快速換臉！選擇一張三立IP圖片 並上傳一張正面清晰的原始圖片 即可生成換臉效果"
        class="relative text-base text-center text-orange-200 w-[307px] max-sm:text-sm max-sm:w-[280px]"
        data-name="三步驟快速換臉！選擇一張三立IP圖片 並上傳一張正面清晰的原始圖片 即可生成換臉效果"
      >
        <span class="text-base text-orange-200 max-sm:text-sm"
          >三步驟快速換臉！選擇一張三立IP圖片<br />並上傳一張正面清晰的原始圖片<br />即可生成換臉效果</span
        >
      </div>
    </div>
  </div>
</template>

<script setup>
const emit = defineEmits(['enter-face-swap'])

function enterFaceSwap() {
  emit('enter-face-swap')
}
</script>

<style scoped>
.circle-border {
  animation: rotate 20s linear infinite;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
