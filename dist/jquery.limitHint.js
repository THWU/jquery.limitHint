'use strict';

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

/**
 * Limit Hint v0.2
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
      'position': 'data-limit-hint-position',
      'delay': 'data-limit-hint-delay',
      'text-valid': 'data-limit-hint-text-valid',
      'text-invalid': 'data-limit-hint-text-invalid'
    },
    'position': 'top-left',
    'delay': 200
  };
  $.fn.LimitHint.limit_type = {
    'maxlen': {
      'text-valid': '還剩餘 {0} 個字',
      'text-invalid': '已超過 {0} 個字',
      'description': '最大字數限制：中、英文字皆佔1個單位'
    },
    'maxlen-bytes': {
      'text-valid': '還剩餘 {0} 個字',
      'text-invalid': '已超過 {0} 個字',
      'description': '最大字數限制：繁/簡中字佔2個單位，其他則佔1個單位'
    }
  };

  function Init(settings, $target) {
    var $lengthHit = $('<div>').addClass('LimitHint').append($('<p>').addClass('length-value'));
    return $target.each(function (index, element) {
      var $that = $(element);

      var _limitType = $that.attr(settings.tags.limit_type);
      var _limit_content = $that.attr(settings.tags.limit_content);
      var _position = $that.attr(settings.tags.position) ? $that.attr(settings.tags.position) : settings['position'];
      var _text_valid_template = $that.attr(settings.tags['text-valid']) ? $that.attr(settings.tags['text-valid']) : $.fn.LimitHint.limit_type[_limitType]['text-valid'];
      var _text_invalid_template = $that.attr(settings.tags['text-invalid']) ? $that.attr(settings.tags['text-invalid']) : $.fn.LimitHint.limit_type[_limitType]['text-invalid'];
      var _text_description = $.fn.LimitHint.limit_type[_limitType]['description'];
      var _delay = $that.attr(settings.tags.delay) ? $that.attr(settings.tags.delay) : settings['delay'];

      $that.on('focus', function () {
        //  set required tag
        $lengthHit.removeAttr('required');
        if ($that.attr('required')) {
          $lengthHit.attr('required', 'required');
        }
        if (!$that.attr('readonly')) {
          var result = GetResult(_limitType, _limit_content, _text_valid_template, _text_invalid_template, $that.val());
          $lengthHit.find('p.length-value').html(result.text);
          //  set invalid tag
          [$that, $lengthHit].forEach(function (item, index, array) {
            item.attr('invalid', result.isValid ? 'false' : 'true');
          });
          //  set position
          $that.parent().css({ 'position': 'relative' });
          $lengthHit.removeClass(function (index, className) {
            return (className.match(/(^|\s)position-\S+/g) || []).join(' ');
          });
          $lengthHit.addClass('position-' + _position);
          if (_position.indexOf('top') > 0) {
            $that.before($lengthHit);
          } else {
            $that.after($lengthHit);
          }
          $lengthHit.attr('title', _text_description);
          $lengthHit.css({ 'display': 'inline-block' });
        }
      });
      $that.on('focusout', function () {
        if (!$that.attr('readonly')) {
          $lengthHit.hide();
        }
      });
      $that.on('keyup', Debounce(function (e) {
        if (!$that.attr('readonly')) {
          var result = GetResult(_limitType, _limit_content, _text_valid_template, _text_invalid_template, $that.val());
          $lengthHit.find('p.length-value').html(result.text);
          [$that, $lengthHit].forEach(function (item, index, array) {
            item.attr('invalid', result.isValid ? 'false' : 'true');
          });
        }
      }, _delay));
    });
  }
  function GetResult(limitType, limitContent, textTemplate_valid, textTemplate_invalid) {
    var input = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : '';

    var textReturn = '';
    var isValid = false;
    switch (limitType) {
      case 'maxlen':
        var remainLength = CalcRemainLength(false, limitContent, input);
        isValid = remainLength >= 0 ? true : false;
        textReturn = (isValid ? textTemplate_valid : textTemplate_invalid).replace('{0}', isValid ? remainLength : -remainLength);
        break;
      case 'maxlen-bytes':
        var remainLength = CalcRemainLength(true, limitContent, input);
        isValid = remainLength >= 0 ? true : false;
        textReturn = (isValid ? textTemplate_valid : textTemplate_invalid).replace('{0}', isValid ? remainLength : -remainLength);
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
  function Debounce(fn, ms) {
    var timer = 0;
    return function () {
      clearTimeout(timer);

      for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      timer = setTimeout(fn.bind.apply(fn, [this].concat(args)), ms || 0);
    };
  }
})(jQuery);