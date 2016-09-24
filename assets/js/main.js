;(function() {
  'use strict';

  const MAX_WIDTH = 480;
  const $ = require('jquery');

  const canvas = document.getElementById('c');
  const ctx = canvas.getContext('2d');
  const drawImage = function(img) {
    ctx.drawImage(img, 0, 0);
  }
  const refresh = function(cb) {
    console.log(window.cachedImage);
    if (cachedImage != null) {
      console.log('------ draw cached image ------');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(cachedImage, 0, 0, canvas.width, canvas.height);
      cb();
    } else {
      console.log('------ no cached image, clear ------');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      cb();
    }
  }
  const draw = function() {
    let text = $('#text').val();
    let $font = $('#font').val();
    let font = $font !== '' ? $font : 'Helvetica';
    let textWidth = ctx.measureText(text).width;
    console.log('textWidth: ', textWidth);
    console.log(text);

    let $fontSize = $('#fontSize').val();
    let fontSize = $fontSize !== '' ? Math.abs(parseInt($fontSize, 10)) : 14;
    ctx.font = `normal ${fontSize}px ${font}`;

    let $fontColorText = $('#fontColorHex').val();
    let fontColor = $fontColorText !== '' ? $fontColorText : '#000000';
    ctx.fillStyle = `${fontColor}`;


    let $checkedPosition = $('.js-banner-position').find('input[type=radio]:checked');
    let position = $checkedPosition.val();
    let posX = 0;
    let posY = fontSize;

    let $margin = $('#textMargin').val();
    let margin = $margin !== '' ? Math.abs(parseInt($margin, 10)) : 0;
    switch (position) {
      case 'rt':
        posX = canvas.width - textWidth - margin;
        posY = fontSize + margin;
        break;
      case 'ct':
        posX = (canvas.width / 2) - (textWidth / 2);
        posY = fontSize + margin;
        break;
      case 'lm':
        posX = 0 + margin;
        posY = (canvas.height / 2) - (fontSize / 2);
        break;
      case 'rm':
        posX = canvas.width - textWidth - margin;
        posY = (canvas.height / 2) - (fontSize / 2);
        break;
      case 'cm':
        posX = (canvas.width / 2) - (textWidth / 2);
        posY = (canvas.height / 2) - (fontSize / 2);
        break;
      case 'lb':
        posX = 0 + margin;
        posY = canvas.height - (fontSize / 2) - margin;
        break;
      case 'rb':
        posX = canvas.width - textWidth - margin;
        posY = canvas.height - (fontSize / 2) - margin;
        break;
      case 'cb':
        posX = (canvas.width / 2) - (textWidth / 2);
        posY = canvas.height - (fontSize / 2) - margin;
        break;
      case 'lt':
      default:
        posX = 0 + margin;
        posY = fontSize + margin;
    }
    console.log('------ position ------');
    console.log('posX: ', posX);
    console.log('posY: ', posY);
    console.log('canvas width: ', canvas.width);
    console.log('canvas height: ', canvas.height);
    refresh(function() {
      ctx.fillText(text, posX, posY);
    });
  }
  document.ondragover = document.ondrop = function (e) {
    e.preventDefault();
  }
  const dandd = document.querySelector('.dandd-section');
  dandd.addEventListener('drop', function (e) {
    console.log('file dropped:', e.dataTransfer.files[0]);

    const file = e.dataTransfer.files[0];
    const image = new Image();
    image.onload = function () {
      window.cachedImage = image;
      const ratio = MAX_WIDTH / image.width;
      const width = image.width <= MAX_WIDTH ? image.width : MAX_WIDTH;
      const height = ratio >= 1 ? image.height : image.height * ratio;
      console.log(width);
      console.log(ratio);
      console.log(height);
      ctx.canvas.width = width;
      ctx.canvas.height = height;
      ctx.drawImage(this, 0, 0, width, height);
      $('.js-text-edit').removeClass('is-hidden');
      $('#danddSpace').addClass('is-hidden');
      $('#cancelImage').removeClass('is-hidden');
    };

    const reader = new FileReader();
    reader.onload = function(e) {
      image.src = e.target.result;
    }
    reader.readAsDataURL(file);
  });

  $('#cancelDragImageButton').on('click', function(e) {
    e.preventDefault();
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    window.cachedImage = null;
    $('#danddSpace').removeClass('is-hidden');
    $('.js-text-edit').addClass('is-hidden');
    $('#cancelImage').addClass('is-hidden');
  });

  $('#fontSize').on('change', function(e) {
    draw();
  });

  $('#font').on('change', function(e) {
    draw();
  });

  $('#fontColor').on('change', function(e) {
    $('#fontColorHex').val($(this).val());
    draw();
  });

  $('#text').on('change', function(e) {
    draw();
  });

  $('#textMargin').on('change', function(e) {
    draw();
  });

  $('.js-banner-position').find('input[type=radio]').on('change', function(e) {
    let value = $(e.target).val();
    console.log(value);
    draw();
  });

  const ipcRenderer = require('electron').ipcRenderer;
  ipcRenderer.on('sendImageComplete', function(event, arg) {
    console.log(event);
    console.log(arg);
    if (arg === true) {
      alert('画像保存完了!');
    } else {
      alert('画像保存に失敗しました…');
    }
  });
  $('#buttonSaveImage').on('click', function(e) {
    const imgSrc = canvas.toDataURL();
    ipcRenderer.send('sendImage', imgSrc.replace(/^data:image\/png;base64,/, ""));
  });

})();