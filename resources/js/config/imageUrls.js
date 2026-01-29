// 使用 Vite 的 import 語法來導入圖片，建置時會自動處理雜湊
import step1Img from '../../images/step1.png'
import step2Img from '../../images/step2.png'
import horizontalImg from '../../images/horizontal.png'
import backImg from '../../images/back.png'
import header1Img from '../../images/header1.png'
import uploadImg from '../../images/upload.png'
import background1Img from '../../images/background1.png'
import homepageImg from '../../images/homepage.png'
import lotsImg from '../../images/lots.png'
import nextImg from '../../images/next.png'
import step2InstructionsImg from '../../images/Step2Instructions.png'
import drawlotGif from '../../images/drawlot.gif'
import drawlotTextImg from '../../images/drawlotText.png'
import drawlotsbgImg from '../../images/drawlotsbg.png'
import drawAgainImg from '../../images/draw_again.png'
import shareImg from '../../images/share.png'

// 使用 Vite 的動態導入來獲取圖片 URL，建置時會自動處理雜湊
export const imageUrls = {
  // 步驟圖片
  step1: step1Img,
  step2: step2Img,
  horizontal: horizontalImg,
  
  // 其他圖片
  back: backImg,
  header1: header1Img,
  upload: uploadImg,
  background1: background1Img,
  homepage: homepageImg,
  lots: lotsImg,
  next: nextImg,
  step2Instructions: step2InstructionsImg,
  drawlot: drawlotGif,
  drawlotText: drawlotTextImg,
  drawlotsbg: drawlotsbgImg,
  drawAgain: drawAgainImg,
  share: shareImg,
};
