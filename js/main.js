$(function(){
  var currentPage = '';
  var cacheControl = '';
  var maxPage = 0;
  var template = $("#videoTemplate").html();
  $(".label-top").text('Total de vídeos');
  $('.content-total-videos').text(0);
  function render(data,action){
    var resultados = $('<div />');
    if(action !== 'prepend'){
      var jaPreenchidos = $('.video-lista');
      if(jaPreenchidos.length > 12){
        $('.ver-anterior').removeClass('sem-mais-paginas');
        for(var i =0;i<12;i++){
          jaPreenchidos.eq(i).remove();
        }
      }
      jaPreenchidos = null;
    }
    data.videos.map(function(video){
      var fragment = new DocumentFragment();
      video.description = ('' + video.description).trim();
      video.date = ('' + video.date).trim();
      if(!video.date){
        video.date = 'Sem data';
      }
      if(!video.description){
        video.description = '- Sem descrição -';
      }
      $(fragment).append(template);
      $(fragment).find('.video-text').text(video.description);
      $(fragment).find('.video-date .date').text(video.date);
      $(fragment).find('.video-date .bandeira').attr('style','background-image: url("img/bandeiras/'+video.country+'.png")');      
      $(fragment).find('.video-icon img').attr('src','img/icones/'+video.icon+'.png');      
      $(fragment).find('.video-banner').addClass('video-'+video.icon).attr('data-id',video.id).attr('data-page',data.page);
      if(video.source.youtube){
        $(fragment).find('.video-banner').html('<iframe width="300" height="200" src="" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe> <a class="linkMobile" target="_blank" rel="noopener"></a>');
        $(fragment).find('iframe').attr('src',video.source.youtube);
      }else {
        var sources = '';
        if(video.source['mp4']){
          var $source = $('<source type="video/mp4">');
          $source.attr('src',video.source['mp4']+'#t=0.5');
          $(fragment).find('.video-banner video').append($source);
        }
        if(video.source['ogg']){
          var $source = $('<source type="video/ogg">');
          $source.attr('src',video.source['mp4']);
          $(fragment).find('.video-banner video').append($source);
        }
      }
      $(fragment).find('a').attr('href',video.url).attr('title',video.description);
      $(fragment).find('img:not([alt])').attr('alt',video.description);
      $('.updated-at').html('Última atualização:<br> <span class="tempoUltimaAtualizacao"><span>');
      if(data.lastUpdated){
        $('.tempoUltimaAtualizacao').text(data.lastUpdated);
      }
      var $video = $(fragment).find('video');     
        
      if(action === 'prepend'){
        resultados.append(fragment);
      }else{
        $('.lista').append(fragment);
      }
      
      // $video.on('pause',function(e){
      //   trackData({
      //     hitType: 'event',
      //     eventCategory: 'Video',
      //     eventAction: 'pause',
      //     eventLabel: e.target.currentSrc
      //   });
      // });

      // $video.on('play',function(e){
      //   trackData({
      //     hitType: 'event',
      //     eventCategory: 'Video',
      //     eventAction: 'play',
      //     eventLabel: e.target.currentSrc
      //   });
      // });
    
    });
    
    if(action === 'prepend'){
      $(resultados.find('.video-lista').get().reverse()).each(function(){
        $('.lista').prepend($(this));
      });
    }
    
    $('.lista .loading-video').remove();
    $('.lista').find('.oculto').removeClass('oculto');
    
    if(data.total){
      $('.content-total-videos').text(data.total);
    }


    $(".label-top").text('Total de vídeos');
    $('body').removeClass('carregando');
    $('.ver-mais-videos,.ver-anterior').removeClass('carregando');
    if(data.videos.length < 12){
      $('.ver-mais-videos').addClass('sem-mais-paginas');
    }

    if(data.page >= maxPage){
      $('.ver-anterior').addClass('sem-mais-paginas');
    }
    if(data.page < maxPage){
      $('.ver-mais-videos').removeClass('sem-mais-paginas');
    }
  }
  function loadVideos(page,action){
    if(page <= 0 && page !== 'latest'){
      $('.lista .loading-video').remove();
      $('body').removeClass('carregando');
      $('.ver-mais-videos').addClass('sem-mais-paginas');
      return;
    }
    $('.ver-mais-videos,.ver-anterior').addClass('carregando');
    $('body').addClass('carregando');
    var dataToRender;
    var expirado = false;
    var minTime = setTimeout(function(){
      expirado = true;
      if(dataToRender){
        render(dataToRender,action);
        dataToRender = null;
      }
    },300);

    if(!cacheControl){
      cacheControl = (new Date * 1);
    }
    var prefix = 'br-';
    if(location.search === '?todos'){
      prefix = '';
    }
    $.ajax({
      url: '/videos/'+prefix+page+'.json?c='+cacheControl,
      dataType: "json",
      success: function(data){
        dataToRender = data;
        cacheControl = data.cacheControl;
        currentPage = data.page;
        if(page === 'latest'){
          maxPage = data.page;
        }
        if(minTime === 0 || expirado){
          dataToRender = null;
          render(data,action);
        }
      },
      error: function(){
        clearTimeout(minTime);
        if(page === 'latest' || page >= maxPage){
          $('.ver-anterior').addClass('sem-mais-paginas');  
        }
        $('.lista .loading-video').remove();
        $('body').removeClass('carregando');
        if(page <= 1){
          $('.ver-mais-videos').addClass('sem-mais-paginas');
        }
      }
    });
  }
  $(document).ready(function(){
    loadVideos('latest','append');
    if(location.search === '?todos'){
      $('.btn-enviar-video').text('Ver vídeos apenas do Brasil').attr('href','/');
    }else{
      $('.btn-enviar-video').text('Ver vídeos do mundo todo').attr('href','/?todos');
    }
  });

  // function trackData(data){
  //   //todo: gdprbot
  //   //track do youtube
  //   //
  //   console.log(data);
  // } 


  // $(document).on('click','a',function(e){
  //   trackData({
  //     hitType: 'event',
  //     eventCategory: 'Link',
  //     eventAction: 'click',
  //     eventLabel: e.target.href
  //   });
  // });
  

  $('.ver-mais-videos').click(function(){
    if($(this).hasClass('carregando')){
      return;
    }
    if(currentPage !== '' && currentPage !== 'latest'){
      currentPage--;
    }
    if(currentPage === ''){
      currentPage = 'latest';
    }
    if(currentPage != 'latest'){
      currentPage = parseInt($('.video-lista:last .video-banner').attr('data-page'));
      currentPage = currentPage - 1;
    }
    loadVideos(currentPage,'append');
  });

  $('.ver-anterior').click(function(){
    if($(this).hasClass('carregando')){
      return;
    }
    var page = parseInt($('.video-lista:eq(0) .video-banner').attr('data-page'));
    if(isNaN(page) || page < 2){
      $('.ver-anterior').addClass('sem-mais-paginas');
      return;
    }
    for(var i =0;i<12;i++){
      $('.video-lista:last').remove();
    }
    loadVideos(page+1,'prepend');
  });
});
