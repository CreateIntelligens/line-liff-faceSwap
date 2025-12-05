// 使用 Vite 的 import 語法來導入圖片，建置時會自動處理雜湊
import step1Img from '../../images/step1.png'
import step2InactiveImg from '../../images/step2_inactive.png'
import step2InprogressImg from '../../images/step2_inprogress.png'
import step3InactiveImg from '../../images/step3_inactive.png'
import step3InprogressImg from '../../images/step3_inprogress.png'
import finishImg from '../../images/finish.png'
import horizontalImg from '../../images/horizontal.png'
import a1art1Img from '../../images/a1art1.png'
import a1art2Img from '../../images/a1art2.png'
import a1art3Img from '../../images/a1art3.png'
import a1art4Img from '../../images/a1art4.png'
import backImg from '../../images/back.png'
import group13948Img from '../../images/Group13948.png'
import header1Img from '../../images/header1.png'
import uploadImg from '../../images/upload.png'
import generateIconImg from '../../images/GenerateIcon.png'
import hpbackgroundImg from '../../images/hpbackground.png'
import background1Img from '../../images/background1.png'

// 使用 Vite 的動態導入來獲取圖片 URL，建置時會自動處理雜湊
export const imageUrls = {
  // 步驟圖片
  step1: step1Img,
  step2_inactive: step2InactiveImg,
  step2_inprogress: step2InprogressImg,
  step3_inactive: step3InactiveImg,
  step3_inprogress: step3InprogressImg,
  finish: finishImg,
  horizontal: horizontalImg,
  
  // 模板圖片
  a1art1: a1art1Img,
  a1art2: a1art2Img,
  a1art3: a1art3Img,
  a1art4: a1art4Img,
  
  // 其他圖片
  back: backImg,
  Group13948: group13948Img,
  header1: header1Img,
  upload: uploadImg,
  generateIcon: generateIconImg,
  hpbackground: hpbackgroundImg,
  background1: background1Img,
};

// 根據模板 ID 獲取圖片
export const getTemplateImage = (templateId) => {
  const imageMap = {
    'a1art1': imageUrls.a1art1,
    'a1art2': imageUrls.a1art2,
    'a1art3': imageUrls.a1art3,
    'a1art4': imageUrls.a1art4,
 
    '1': imageUrls.a1art1,
    '2': imageUrls.a1art2,
    '3': imageUrls.a1art3,
    '4': imageUrls.a1art4,
  };
  
  return imageMap[templateId] || imageUrls.a1art1;
};
