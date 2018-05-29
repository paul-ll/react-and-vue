//统一的图片压缩工具，使用webp技术


//首页货架频道图片处理
function compressCategoryBackImage(categoryList){

  if(categoryList && categoryList instanceof Array){
    let length = categoryList.length;
    for(let i = 0; i < length; i++){
      let categoryItem = categoryList[i];
      categoryItem.icon = compressImage(categoryItem.icon);

      let category_image = categoryItem.category_image;
      if (category_image) {
        categoryItem.category_image = compressImage(category_image);
      }

      let group_bottom_img = categoryItem.group_bottom_img;
      if (group_bottom_img) {
        categoryItem.group_bottom_img = compressImage(group_bottom_img);
      }
    }
  }
}

//首页货架Banner图片处理
function compressBannerImage(banners) {
  if (banners && banners instanceof Array) {
    let length = banners.length;
    for (let index = 0; index < length; index++) {
      const element = banners[index];
      element.path = compressImage(element.path);
    }
  }
}

//首页货架瓷片位处理
function compressCategoryAreas(categoryAreas) {
  if (categoryAreas && categoryAreas instanceof Array) {
    let length = categoryAreas.length;
    for (let index = 0; index < length; index++) {
      const element = categoryAreas[index];
      element.image = compressImage(element.image);
    }
  }
}

//购物车页商品图片处理
function compressShoppingCartProductImage(products){
  if (products && products instanceof Array) {
    let length = products.length;
    for (let index = 0; index < length; index++) {
      const element = products[index];
      element.images.cart = compressImage(element.images.cart);
    }
  }
}

//商品详情页商品图片
function compressProductDetailProductImage(productImages){
  if (productImages && productImages instanceof Array) {
    let length = productImages.length;
    for (let index = 0; index < length; index++) {
      const element = productImages[index];
      productImages[index] = compressImage(element);
    }
  }
}

//商品详情页描述图片
function compressProductDetailDescImage(productDescs){
  if (productDescs && productDescs instanceof Array) {
    let length = productDescs.length;
    for (let index = 0; index < length; index++) {
      const element = productDescs[index];
      element.image = compressImage(element.image);
    }
  }
}

function compressImage(imageUrl){
  return imageUrl + "?iopcmd=convert&dst=jpg&q=80";
}

module.exports = {
  compressCategoryBackImage: compressCategoryBackImage,
  compressBannerImage: compressBannerImage,
  compressImage: compressImage,
  compressCategoryAreas: compressCategoryAreas,
  compressShoppingCartProductImage: compressShoppingCartProductImage,
  compressProductDetailProductImage: compressProductDetailProductImage,
  compressProductDetailDescImage: compressProductDetailDescImage,
}