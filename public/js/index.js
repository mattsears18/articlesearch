$(function() {
  $('#articleUploadBtn').click(function() {
    $('#articleUploadFile').click();
  });

  $('#articleUploadFile').change(function() {
    $(this).closest('form').submit();
  });

  var progress = $('.progress');
  var bar = $('.bar');
  var percent = $('.percent');
  var status = $('#status');

  $('form').ajaxForm({
      beforeSend: function() {
        status.empty();
        var percentVal = '0%';
        bar.width(percentVal)
        bar.html(percentVal);
        progress.slideDown();
      },
      uploadProgress: function(event, position, total, percentComplete) {
        var percentVal = percentComplete + '%';
        bar.width(percentVal)
        bar.html(percentVal);
        //console.log(percentVal, position, total);
      },
      success: function() {
        var percentVal = '100%';
        bar.width(percentVal)
        bar.html(percentVal);
      },
  	complete: function(xhr) {
  		status.html(xhr.responseText);
      progress.slideUp();
      window.location.href = '/';
  	}
  });
});
