// 使用 Vite 的 import 語法來導入圖片，建置時會自動處理雜湊
import horizontalImg from '../../images/horizontal.png'
import backImg from '../../images/back.png'
import header1Img from '../../images/header1.png'
import uploadImg from '../../images/upload.png'
import background1Img from '../../images/background1.png'
import homepageImg from '../../images/homepage.png'
import lotsImg from '../../images/lots.png'
import nextImg from '../../images/next.png'
import drawlotGif from '../../images/drawlot.gif'
import drawlotTextImg from '../../images/drawlotText.png'
import drawlotsbgImg from '../../images/drawlotsbg.png'
import drawAgainImg from '../../images/draw_again.png'
import shareImg from '../../images/share.png'
import disableImg from '../../images/disable.png'
import enterpriseImg from '../../images/enterprise.png'
import enterpriseImageImg from '../../images/enterpriseImage.png'
import enterpriseButtonClayImg from '../../images/enterprisebuttonclay.png'
import enterpriseButtonGrayImg from '../../images/enterprisebuttongray.png'

// 使用 Vite 的動態導入來獲取圖片 URL，建置時會自動處理雜湊
export const imageUrls = {
  // 步驟圖片
  horizontal: horizontalImg,
  
  // 其他圖片
  back: backImg,
  header1: header1Img,
  upload: uploadImg,
  background1: background1Img,
  homepage: homepageImg,
  lots: lotsImg,
  next: nextImg,
  drawlot: drawlotGif,
  drawlotText: drawlotTextImg,
  drawlotsbg: drawlotsbgImg,
  drawAgain: drawAgainImg,
  share: shareImg,
  disable: disableImg,
  enterprise: enterpriseImg,
  enterpriseImage: enterpriseImageImg,
  enterpriseButtonClay: enterpriseButtonClayImg,
  enterpriseButtonGray: enterpriseButtonGrayImg,
};
