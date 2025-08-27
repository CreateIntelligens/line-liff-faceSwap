// 圖片引用配置 - 讓 Vite 能處理圖片並帶雜湊
// 所有圖片都從 resources/images/ 目錄引入

// 步驟圖片
export const stepImages = {
  step1: new URL('../../images/step1.png', import.meta.url).href,
  step2_inactive: new URL('../../images/step2_inactive.png', import.meta.url).href,
  step2_inprogress: new URL('../../images/step2_inprogress.png', import.meta.url).href,
  step3_inactive: new URL('../../images/step3_inactive.png', import.meta.url).href,
  step3_inprogress: new URL('../../images/step3_inprogress.png', import.meta.url).href,
  finish: new URL('../../images/finish.png', import.meta.url).href,
  horizontal: new URL('../../images/horizontal.png', import.meta.url).href,
};

// 模板圖片
export const templateImages = {
  play: new URL('../../images/play.png', import.meta.url).href,   // 綜藝玩很大
  wife: new URL('../../images/wife.png', import.meta.url).href,   // 犀利人妻
  love: new URL('../../images/love.png', import.meta.url).href,   // 命中註定我愛你
  super: new URL('../../images/super.png', import.meta.url).href, // 超級夜總會
};

// 其他圖片
export const otherImages = {
  back: new URL('../../images/back.png', import.meta.url).href,
  crown: new URL('../../images/crown.png', import.meta.url).href,
  Group13948: new URL('../../images/Group13948.png', import.meta.url).href,
  header: new URL('../../images/header.png', import.meta.url).href,
  logo: new URL('../../images/logo.png', import.meta.url).href,
  star: new URL('../../images/star.png', import.meta.url).href,
  upload: new URL('../../images/upload.png', import.meta.url).href,
  wife: new URL('../../images/wife.png', import.meta.url).href,
};

// 根據模板 ID 獲取圖片
export const getTemplateImage = (templateId) => {
  const imageMap = {
    '1': templateImages.play,   // 綜藝玩很大
    '2': templateImages.wife,   // 犀利人妻
    '3': templateImages.love,   // 命中註定我愛你
    '4': templateImages.super,  // 超級夜總會
    'play': templateImages.play,
    'wife': templateImages.wife,
    'love': templateImages.love,
    'super': templateImages.super,
  };
  
  return imageMap[templateId] || templateImages.play;
};

// 導出所有圖片
export const allImages = {
  ...stepImages,
  ...templateImages,
  ...otherImages,
};
