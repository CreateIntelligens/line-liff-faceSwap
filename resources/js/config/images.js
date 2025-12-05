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
  a1art1: new URL('../../images/a1art1.png', import.meta.url).href,
  a1art2: new URL('../../images/a1art2.png', import.meta.url).href,
  a1art3: new URL('../../images/a1art3.png', import.meta.url).href,
  a1art4: new URL('../../images/a1art4.png', import.meta.url).href,
};

// 其他圖片
export const otherImages = {
  back: new URL('../../images/back.png', import.meta.url).href,
  Group13948: new URL('../../images/Group13948.png', import.meta.url).href,
  header1: new URL('../../images/header1.png', import.meta.url).href,
  upload: new URL('../../images/upload.png', import.meta.url).href,
  generateIcon: new URL('../../images/GenerateIcon.png', import.meta.url).href,
  hpbackground: new URL('../../images/hpbackground.png', import.meta.url).href,
  background1: new URL('../../images/background1.png', import.meta.url).href,
};

// 根據模板 ID 獲取圖片
export const getTemplateImage = (templateId) => {
  const imageMap = {
    'a1art1': templateImages.a1art1,
    'a1art2': templateImages.a1art2,
    'a1art3': templateImages.a1art3,
    'a1art4': templateImages.a1art4,
    // 舊模板 ID 映射到新模板（向後兼容）
    '1': templateImages.a1art1,
    '2': templateImages.a1art2,
    '3': templateImages.a1art3,
    '4': templateImages.a1art4,
  };
  
  return imageMap[templateId] || templateImages.a1art1;
};

// 導出所有圖片
export const allImages = {
  ...stepImages,
  ...templateImages,
  ...otherImages,
};
