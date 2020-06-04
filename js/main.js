$(function(){
  var currentPage = 1;
  var cacheControl = '';
  var template = $("#videoTemplate").html();
  $(".label-top").text('Total de vídeos');
  $('.content-total-videos').text(0);
  function render(data){
    var resultados = new DocumentFragment();
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
      // $(fragment).find('.video-date .bandeira').attr('style','background-image: url("img/bandeiras/'+video.country+'.png")');      
      $(fragment).find('.video-icon img').attr('src','img/icones/'+video.icon+'.png');      
      $(fragment).find('.video-banner').addClass('video-'+video.icon).attr('data-id',video.id);
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
      $('.tempoUltimaAtualizacao').text(data.lastUpdated);
      $('.lista').append(fragment);
    });
    
    $('.lista .loading-video').remove();
    $('.lista').find('.oculto').removeClass('oculto');
    $('.content-total-videos').text(data.total);
    $(".label-top").text('Total de vídeos');
    $('body').removeClass('carregando');
    $('.ver-mais-videos').removeClass('carregando');
    if(data.videos.length < 12){
      $('.ver-mais-videos').addClass('sem-mais-paginas');
    }
  }
  function loadVideos(page){
    $('.ver-mais-videos').addClass('carregando');
    $('body').addClass('carregando');
    var dataToRender;
    var expirado = false;
    var minTime = setTimeout(function(){
      expirado = true;
      if(dataToRender){
        render(dataToRender);
        dataToRender = null;
      }
    },300);
    if(page === 'latest'){
      page = 1;
    }
    if(!cacheControl){
      cacheControl = (new Date * 1);
    }
    $.ajax({
      url: '/videos/'+page+'.json?c='+cacheControl,
      dataType: "json",
      success: function(data){
        dataToRender = data;
        cacheControl = data.cacheControl;
        if(minTime === 0 || expirado){
          dataToRender = null;
          render(data);
        }
      },
      error: function(){
        clearTimeout(minTime);
        $('.lista .loading-video').remove();
        $('body').removeClass('carregando');
        $('.ver-mais-videos').addClass('sem-mais-paginas');
      }
    });
  }
  $(document).ready(function(){
    loadVideos('latest');
  });

  $('.ver-mais-videos').click(function(){
    if($(this).hasClass('carregando')){
      return;
    }
    if(currentPage == 'currentPage'){
      currentPage = 1;
    }
    currentPage++;
    loadVideos(currentPage);
  });
});
