/**
 * Limit Hint v0.1
 * ===================================
 * data validate hint
 *
 * (c) 2019 Tehsien Wu
 * None Licensed
 */

(function($) {
  $.fn.LimitHint = function (options) {
    // This is the easiest way to have default options.
    var settings = $.extend({}, $.fn.LimitHint.defaults , options);
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
      'text-invalid': 'data-limit-hint-text-invalid',
    },
    'position': 'top-left',
    'delay': 200,
  };
  $.fn.LimitHint.limit_type = {
    'maxlen': {
      'text-valid': '還剩餘 {0} 個字',
      'text-invalid': '已超過 {0} 個字',
      'description': '最大字數限制：中、英文字皆佔1個單位',
    },
    'maxlen-bytes': {
      'text-valid': '還剩餘 {0} 個字',
      'text-invalid': '已超過 {0} 個字',
      'description': '最大字數限制：繁/簡中字佔2個單位，其他則佔1個單位',
    }
  }

  function Init(settings, $target) {
    var $lengthHit = $('<div>').addClass('LimitHint').append($('<p>').addClass('length-value'));
    return $target.each((index, element) => {
      var $that = $(element);

      const _limitType = $that.attr(settings.tags.limit_type);
      const _limit_content = $that.attr(settings.tags.limit_content);
      const _position = $that.attr(settings.tags.position) ? $that.attr(settings.tags.position):settings['position'];
      const _text_valid_template = $that.attr(settings.tags['text-valid']) ? $that.attr(settings.tags['text-valid']):$.fn.LimitHint.limit_type[_limitType]['text-valid'];
      const _text_invalid_template = $that.attr(settings.tags['text-invalid']) ? $that.attr(settings.tags['text-invalid']):$.fn.LimitHint.limit_type[_limitType]['text-invalid'];
      const _text_description = $.fn.LimitHint.limit_type[_limitType]['description'];
      const _delay = $that.attr(settings.tags.delay) ? $that.attr(settings.tags.delay):settings['delay'];

      $that.on('focus', () => {
        //  set required tag
        $lengthHit.removeAttr('required');
        if ($that.attr('required')) {
          $lengthHit.attr('required', 'required');
        }
        if (!$that.attr('readonly')) {
          var result = GetResult(_limitType, _limit_content, _text_valid_template, _text_invalid_template, $that.val());
          $lengthHit.find('p.length-value').html(result.text);
          //  set invalid tag
          [$that, $lengthHit].forEach((item, index, array) => {
            item.attr('invalid', result.isValid ? 'false' : 'true');
          });
          //  set position
          $that.parent().css({'position':'relative'});
          $lengthHit.removeClass(function (index, className) {
            return (className.match (/(^|\s)position-\S+/g) || []).join(' ');
          });
          $lengthHit.addClass(`position-${_position}`);
          if (_position.indexOf('top') > 0) {
            $that.before($lengthHit);
          }else {
            $that.after($lengthHit);
          }
          $lengthHit.attr('title', _text_description);
          $lengthHit.css({'display':'inline-block'});
        }
      });
      $that.on('focusout', () => {
        if (!$that.attr('readonly')) {
          $lengthHit.hide();
        }
      });
      $that.on('keyup', Debounce((e) => {
        if (!$that.attr('readonly')) {
          var result = GetResult(_limitType, _limit_content, _text_valid_template, _text_invalid_template, $that.val());
          $lengthHit.find('p.length-value').html(result.text);
          [$that, $lengthHit].forEach((item, index, array) => {
            item.attr('invalid', result.isValid ? 'false' : 'true');
          });
        }
      }, _delay));
    });
  }
  function GetResult(limitType, limitContent, textTemplate_valid, textTemplate_invalid, input = '') {
    var textReturn = '';
    var isValid = false;
    switch (limitType) {
      case 'maxlen':
        var remainLength = CalcRemainLength(false, limitContent, input);
        isValid = remainLength >= 0 ? true: false;
        textReturn = (isValid ? textTemplate_valid : textTemplate_invalid).replace('{0}', isValid ? remainLength:-remainLength);
        break;
      case 'maxlen-bytes':
        var remainLength = CalcRemainLength(true, limitContent, input);
        isValid = remainLength >= 0 ? true: false;
        textReturn = (isValid ? textTemplate_valid : textTemplate_invalid).replace('{0}', isValid ? remainLength:-remainLength);
        break;
      default:
        break;
    }
    return {
      'text': textReturn,
      'isValid': isValid,
    };
  }
  function CalcRemainLength(isBytesLen = false, len_limit, input = '') {
    return len_limit - (isBytesLen ? GetBytesLength(input) : input.length);
  }
  function GetBytesLength(text) {
    var regex = /[^\u4e00-\u9fa5]/; //  非中文的 unicode 編號範圍 
    var length = 0;
    [...text].forEach((value, index, array) => {
      length += regex.test(value) ? 1 : 2;
    });
    return length;
  }
  function Debounce(fn, ms) {
    let timer = 0
    return function(...args) {
      clearTimeout(timer)
      timer = setTimeout(fn.bind(this, ...args), ms || 0)
    }
  }
})(jQuery)