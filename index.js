let refs = {};
refs.imagePreviews = document.querySelector('#previews');
refs.fileSelector = document.querySelector('input[type=file]');

function addImageBox(container) {
  let imageBox = document.createElement("div");
  let progressBox = document.createElement("progress");
  imageBox.appendChild(progressBox);
  container.appendChild(imageBox);
  
  return imageBox;
}

function processFile(file) {
  if (!file) {
    return;
  }
  console.log(file);

  let imageBox = addImageBox(refs.imagePreviews);

  // Load the data into an image
  new Promise(function (resolve, reject) {
    let rawImage = new Image();

    rawImage.addEventListener("load", function () {
      resolve(rawImage);
    });

    rawImage.src = URL.createObjectURL(file);
  })
  .then(function (rawImage) {
    // Convert image to webp ObjectURL via a canvas blob
    return new Promise(function (resolve, reject) {
      let canvas = document.createElement('canvas');
      let ctx = canvas.getContext("2d");
      let imgType = canvasToImg(canvas);
      canvas.width = rawImage.width;
      canvas.height = rawImage.height;
      ctx.drawImage(rawImage, 0, 0);
      canvas.toBlob(function (blob) {
        resolve({ imageURL:URL.createObjectURL(blob), imgType:imgType});
      }, imgType);
    });
  })
  .then(function (imageData) {
    // Load image for display on the page
    return new Promise(function (resolve, reject) {
      imageData.scaledImg = new Image();
      imageData.scaledImg.addEventListener("load", function () {
        resolve(imageData);
      });

      imageData.scaledImg.setAttribute("src", imageData.imageURL);
    });
  })
  .then(function (data) {
    // Inject into the DOM
    let imageLink = document.createElement("a");
    let imgType = data.imgType.split('/')[1];
    imageLink.setAttribute("href", data.imageURL);
    imageLink.setAttribute('download', `${file.name}.${imgType}`);
    imageLink.appendChild(data.scaledImg);

    imageBox.innerHTML = "";
    imageBox.appendChild(imageLink);
  });
}

function processFiles(files) {
  for (let file of files) {
    processFile(file);
  }
}

function fileSelectorChanged() {
  processFiles(refs.fileSelector.files);
  refs.fileSelector.value = "";
}

refs.fileSelector.addEventListener("change", fileSelectorChanged);

// Set up Drag and Drop
function dragenter(e) {
  e.stopPropagation();
  e.preventDefault();
}

function dragover(e) {
  e.stopPropagation();
  e.preventDefault();
}

function drop(callback, e) {
  e.stopPropagation();
  e.preventDefault();
  callback(e.dataTransfer.files);
}

function setDragDrop(area, callback) {
  area.addEventListener("dragenter", dragenter, false);
  area.addEventListener("dragover", dragover, false);
  area.addEventListener("drop", function (e) { drop(callback, e); }, false);
}
setDragDrop(document.documentElement, processFiles);

//canvas轉換为image
function canvasToImg(canvas) {
    var array=["image/webp","image/jpeg","image/png"],
        type=document.getElementById('myselect').value-1;
    var src = array[type];
    return src;
}