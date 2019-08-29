/**
 * ll_datalengthvalidate v1.0,
 * ===================================
 * L&L EIP system plugin: data length validate tool
 *
 * (c) 2019 Tehsien Wu
 * None Licensed
 */

(function ($) {
  $.fn.LL_DataLengthValidate = function(options) {
    // This is the easiest way to have default options.
    var settings = $.extend({
        // These are the defaults.
        trigger_tag: 'data-len-validate',
        maxlen_tag: 'data-maxlen',
        maxlen_bytes_tag: 'data-maxlen-bytes',
        tip_position_tag: 'data-tip-position',
    }, options );
    if ($lengthHit) { $lengthHit.find('p').text(''); }
    else { var $lengthHit = $('<div>').addClass('length-hint ll_dataLengthValidate').append($('<p>').addClass('length-value')); }
    $.fn.LL_DataLengthValidate_Init(settings, $lengthHit, this);
  };
  $.fn.LL_DataLengthValidate_Init = function(settings, $lengthHit, $target) {
    return $target.each(function() {
      var $that = $(this);
      var isBytesLen = $that.attr(settings.maxlen_bytes_tag) ? true : false;
      $that.on('focus', function() {
        if (!$that.attr('readonly')) {
          var remainLength = parseInt(isBytesLen ? $that.attr(settings.maxlen_bytes_tag) : $that.attr(settings.maxlen_tag)) - (isBytesLen ? bytesLength($that.val()) : $that.val().length);
          $lengthHit.find('p.length-value').text(`剩餘 ${remainLength} 個字`);
          remainLength < 0 ? $that.attr('invalid', 'true') : $that.attr('invalid', 'false');
          $that.parent().css({'position':'relative'});
          $lengthHit.removeClass('position-left-top position-left-bottom position-right-top position-right-bottom');
          $lengthHit.addClass(`position-${$that.attr(settings.tip_position_tag)}`);
          if ($that.attr(settings.tip_position_tag).indexOf('top') > 0) {
            $that.before($lengthHit);
          }else {
            $that.after($lengthHit);
          }
          $lengthHit.show();
        }
      });
      $that.on('focusout', function() {
        if (!$that.attr('readonly')) {
          $lengthHit.hide();
        }
      });
      $that.on('keyup', function() {
        if (!$that.attr('readonly')) {
          var remainLength = parseInt(isBytesLen ? $that.attr(settings.maxlen_bytes_tag) : $that.attr(settings.maxlen_tag)) - (isBytesLen ? bytesLength($that.val()) : $that.val().length);
          $lengthHit.find('p.length-value').text(`剩餘 ${remainLength} 個字`);
          remainLength < 0 ? $that.attr('invalid', 'true') : $that.attr('invalid', 'false');
        }
      });
    });
  }
})(jQuery)