'use strict';

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

/**
 * Limit Hint v0.1
 * ===================================
 * data validate hint
 *
 * (c) 2019 Tehsien Wu
 * None Licensed
 */

(function ($) {
  $.fn.LimitHint = function (options) {
    // This is the easiest way to have default options.
    var settings = $.extend({}, $.fn.LimitHint.defaults, options);
    Init(settings, this);
  };
  $.fn.LimitHint.defaults = {
    // These are the defaults.
    'tags': {
      'auto_discover': 'data-limit-hint',
      'limit_type': 'data-limit-hint-type',
      'limit_content': 'data-limit-hint-content',
      'position': 'data-limit-hint-position'
    },
    'text-valid': '還剩餘 {0} 個字'
  };
  $.fn.LimitHint.limit_type = {
    'maxlen': {
      'Description': '最大字數限制：中、英文字皆判斷1個單位'
    },
    'maxlen-bytes': {
      'Description': '最大字數限制：繁/簡中字為2個單位，其他則為1個單位'
    }
  };

  function Init(settings, $target) {
    var $lengthHit = $('<div>').addClass('LimitHint').append($('<p>').addClass('length-value'));
    return $target.each(function (index, element) {
      var $that = $(element);

      var _limitType = $that.attr(settings.tags.limit_type);
      var _limit_content = $that.attr(settings.tags.limit_content);
      var _position = $that.attr(settings.tags.position);
      var _text_valid_template = settings['text-valid'];

      $that.on('focus', function () {
        //  set required tag
        $lengthHit.removeAttr('required');
        if ($that.attr('required')) {
          $lengthHit.attr('required', 'required');
        }
        if (!$that.attr('readonly')) {
          var result = GetResult(_limitType, _limit_content, _text_valid_template, $that.val());
          $lengthHit.find('p.length-value').text(result.text);
          //  set invalid tag
          [$that, $lengthHit].forEach(function (item, index, array) {
            item.attr('invalid', result.isValid ? 'false' : 'true');
          });
          //  set position
          $that.parent().css({ 'position': 'relative' });
          $lengthHit.removeClass(function (index, className) {
            return (className.match(/(^|\s)position-\S+/g) || []).join(' ');
          });
          $lengthHit.addClass('position-' + $that.attr(settings.tags.position));
          if ($that.attr(settings.tags.position).indexOf('top') > 0) {
            $that.before($lengthHit);
          } else {
            $that.after($lengthHit);
          }
          $lengthHit.show();
        }
      });
      $that.on('focusout', function () {
        if (!$that.attr('readonly')) {
          $lengthHit.hide();
        }
      });
      $that.on('keyup', function () {
        if (!$that.attr('readonly')) {
          var result = GetResult(_limitType, _limit_content, _text_valid_template, $that.val());
          $lengthHit.find('p.length-value').text(result.text);
          [$that, $lengthHit].forEach(function (item, index, array) {
            item.attr('invalid', result.isValid ? 'false' : 'true');
          });
        }
      });
    });
  }
  function GetResult(limitType, limitContent, textTemplate) {
    var input = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : '';

    var textReturn = '';
    var isValid = false;
    switch (limitType) {
      case 'maxlen':
        var remainLength = CalcRemainLength(false, limitContent, input);
        isValid = remainLength >= 0 ? true : false;
        textReturn = textTemplate.replace('{0}', remainLength);
        break;
      case 'maxlen-bytes':
        var remainLength = CalcRemainLength(true, limitContent, input);
        isValid = remainLength >= 0 ? true : false;
        textReturn = textTemplate.replace('{0}', remainLength);
        break;
      default:
        break;
    }
    return {
      'text': textReturn,
      'isValid': isValid
    };
  }
  function CalcRemainLength() {
    var isBytesLen = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
    var len_limit = arguments[1];
    var input = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : '';

    return len_limit - (isBytesLen ? GetBytesLength(input) : input.length);
  }
  function GetBytesLength(text) {
    var regex = /[^\u4e00-\u9fa5]/; //  非中文的 unicode 編號範圍 
    var length = 0;
    [].concat(_toConsumableArray(text)).forEach(function (value, index, array) {
      length += regex.test(value) ? 1 : 2;
    });
    return length;
  }
})(jQuery);