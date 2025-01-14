/*
 * Solo - A small and beautiful blogging system written in Java.
 * Copyright (c) 2010-present, b3log.org
 *
 * Solo is licensed under Mulan PSL v2.
 * You can use this software according to the terms and conditions of the Mulan PSL v2.
 * You may obtain a copy of Mulan PSL v2 at:
 *         http://license.coscl.org.cn/MulanPSL2
 * THIS SOFTWARE IS PROVIDED ON AN "AS IS" BASIS, WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO NON-INFRINGEMENT, MERCHANTABILITY OR FIT FOR A PARTICULAR PURPOSE.
 * See the Mulan PSL v2 for more details.
 */
/**
 * @fileoverview Page util, load heighlight and process comment.
 *
 * @author <a href="http://vanessa.b3log.org">Liyuan Li</a>
 * @author <a href="http://88250.b3log.org">Liang Ding</a>
 * @version 2.8.0.1, Apr 30, 2020
 */
window.Page = function (tips) {
  this.currentCommentId = ''
  this.tips = tips
}

$.extend(Page.prototype, {
  /**
   * 第三方评论
   */
  vcomment: function () {
    const $vcomment = $('#vcomment')
    if ($vcomment.length === 0) {
      return
    }
    const vcomment = new Vcomment({
      id: 'vcomment',
      postId: $vcomment.data('postid'),
      url: 'https://hacpai.com',
      userName: $vcomment.data('name'),
      currentPage: 1,
      vditor: {
        lineNumber: Label.showCodeBlockLn,
        hljsEnable: !Label.luteAvailable,
        hljsStyle: Label.hljsStyle,
      },
      error () {
        $vcomment.remove()
        $('#soloComments').show()
      },
    })

    vcomment.render()
  },
  /**
   * 分享
   */
  share: function () {
    var $this = $('.article__share')
    if ($this.length === 0) {
      return
    }
    var $qrCode = $this.find('.item__qr')
    var shareURL = $this.data('url')
    var avatarURL = $this.data('avatar')
    var title = encodeURIComponent($this.data('title') + ' - ' +
      $this.data('blogtitle'))
    var url = encodeURIComponent(shareURL)

    var urls = {}
    urls.tencent = 'http://share.v.t.qq.com/index.php?c=share&a=index&title=' +
      title +
      '&url=' + url + '&pic=' + avatarURL
    urls.weibo = 'http://v.t.sina.com.cn/share/share.php?title=' +
      title + '&url=' + url + '&pic=' + avatarURL
    urls.qqz = 'https://sns.qzone.qq.com/cgi-bin/qzshare/cgi_qzshare_onekey?url='
      + url + '&sharesource=qzone&title=' + title + '&pics=' + avatarURL
    urls.twitter = 'https://twitter.com/intent/tweet?status=' + title + ' ' +
      url

    $this.find('span').click(function () {
      var key = $(this).data('type')

      if (!key) {
        return
      }

      if (key === 'wechat') {
        if (typeof QRious === 'undefined') {
          Util.addScript(Label.staticServePath + '/js/lib/qrious.min.js',
            'qriousScript')
        }

        if ($qrCode.css('background-image') === 'none') {
          const qr = new QRious({
            padding: 0,
            element: $qrCode[0],
            value: shareURL,
            size: 99,
          })
          $qrCode.css('background-image', `url(${qr.toDataURL('image/jpeg')})`).
            show()
        } else {
          $qrCode.slideToggle()
        }
        return false
      }

      window.open(urls[key], '_blank', 'top=100,left=200,width=648,height=618')
    })
  },
  /*
   * @description 文章加载
   */
  load: function () {
    var that = this
    // comment
    $('#comment').click(function () {
      that.toggleEditor()
    }).attr('readonly', 'readonly')

    $('#soloEditorCancel').click(function () {
      that.toggleEditor()
    })
    $('#soloEditorAdd').click(function () {
      that.submitComment()
    })
    that.vcomment()
  },
  toggleEditor: function (commentId, name) {
    var $editor = $('#soloEditor')
    if ($editor.length === 0) {
      location.href = Label.servePath + '/start'
      return
    }

    if (!$('#soloEditorComment').hasClass('vditor')) {
      var that = this
      var resizeEnable = true
      var toolbar = [
        'emoji',
        'headings',
        'bold',
        'italic',
        'strike',
        'link',
        '|',
        'list',
        'ordered-list',
        'check',
        'outdent',
        'indent',
        '|',
        'quote',
        'line',
        'code',
        'inline-code',
        'table',
        'insert-before',
        'insert-after',
        'undo',
        'redo',
        '|',
        'fullscreen',
        'edit-mode',
        {
          name: 'more',
          toolbar: [
            'both',
            'code-theme',
            'content-theme',
            'export',
            'outline',
            'preview',
            'format',
            'devtools',
            'info',
            'help',
          ],
        }]
      if ($(window).width() < 768) {
        toolbar = [
          'emoji',
          'link',
          'edit-mode',
          {
            name: 'more',
            toolbar: [
              'insert-after',
              'fullscreen',
              'preview',
              'format',
              'info',
              'help',
            ],
          },
        ]
        resizeEnable = false
      }

      window.vditor = new Vditor('soloEditorComment', {
        placeholder: that.tips.commentContentCannotEmptyLabel,
        height: 180,
        tab: '\t',
        esc: function () {
          $('#soloEditorCancel').click()
        },
        ctrlEnter: function () {
          $('#soloEditorAdd').click()
        },
        preview: {
          delay: 500,
          mode: 'editor',
          url: Label.servePath + '/console/markdown/2html',
          hljs: {
            enable: !Label.luteAvailable,
            style: Label.hljsStyle,
          },
          parse: function (element) {
            if (element.style.display === 'none') {
              return
            }
            Util.parseMarkdown()
          },
        },
        counter: {
          enable: true,
          max: 500,
        },
        resize: {
          enable: resizeEnable,
          position: 'top',
        },
        lang: Label.langLabel,
        toolbar,
        after: () => {
          vditor.focus()
        },
      })
    }

    if ($editor.css('bottom') === '-300px' || commentId) {
      $('#soloEditorError').text('')
      if ($(window).width() < 768) {
        $editor.css({'top': '0', 'bottom': 'auto', 'opacity': 1})
      } else {
        $editor.css({'bottom': '0', top: 'auto', 'opacity': 1})
      }

      this.currentCommentId = commentId
      $('#soloEditorReplyTarget').text(name ? '@' + name : '')
      if (typeof vditor !== 'undefined' && vditor.vditor.wysiwyg) {
        vditor.focus()
      }
    } else {
      $editor.css({'bottom': '-300px', top: 'auto', 'opacity': 0})
    }
  },
  /*
   * @description 加载随机文章
   * @param {String} headTitle 随机文章标题
   */
  loadRandomArticles: function (headTitle) {
    var randomArticles1Label = this.tips.randomArticles1Label
    // getRandomArticles
    $.ajax({
      url: Label.servePath + '/articles/random',
      type: 'POST',
      success: function (result, textStatus) {
        var randomArticles = result.randomArticles
        if (!randomArticles || 0 === randomArticles.length) {
          $('#randomArticles').remove()
          return
        }

        var listHtml = ''
        for (var i = 0; i < randomArticles.length; i++) {
          var article = randomArticles[i]
          var title = article.articleTitle
          var randomArticleLiHtml = '<li>' + '<a rel=\'nofollow\' title=\'' +
            title + '\' href=\'' + Label.servePath +
            article.articlePermalink + '\'>' + title + '</a></li>'
          listHtml += randomArticleLiHtml
        }

        var titleHTML = headTitle ? headTitle : '<h4>' + randomArticles1Label +
          '</h4>'
        var randomArticleListHtml = titleHTML + '<ul>' +
          listHtml + '</ul>'
        $('#randomArticles').append(randomArticleListHtml)
      },
    })
  },
  /*
   * @description 加载相关文章
   * @param {String} id 文章 id
   * @param {String} headTitle 相关文章标题
   */
  loadRelevantArticles: function (id, headTitle) {
    $.ajax({
      url: Label.servePath + '/article/id/' + id + '/relevant/articles',
      type: 'GET',
      success: function (data, textStatus) {
        var articles = data.relevantArticles
        if (!articles || 0 === articles.length) {
          $('#relevantArticles').remove()
          return
        }
        var listHtml = ''
        for (var i = 0; i < articles.length; i++) {
          var article = articles[i]
          var title = article.articleTitle
          var articleLiHtml = '<li>'
            + '<a rel=\'nofollow\' title=\'' + title + '\' href=\'' +
            Label.servePath + article.articlePermalink + '\'>'
            + title + '</a></li>'
          listHtml += articleLiHtml
        }

        var relevantArticleListHtml = headTitle
          + '<ul>'
          + listHtml + '</ul>'
        $('#relevantArticles').append(relevantArticleListHtml)
      },
      error: function () {
        $('#relevantArticles').remove()
      },
    })
  },
  /*
   * @description 加载站外相关文章
   * @param {String} tags 文章 tags
   * @param {String} headTitle 站外相关文章标题
   */
  loadExternalRelevantArticles: function (tags, headTitle) {
    var tips = this.tips
    try {
      $.ajax({
        url: 'https://rhythm.b3log.org/get-articles-by-tags.do?tags=' + tags
          + '&blogHost=' + tips.blogHost + '&paginationPageSize=' +
          tips.externalRelevantArticlesDisplayCount,
        type: 'GET',
        cache: true,
        dataType: 'jsonp',
        error: function () {
          $('#externalRelevantArticles').remove()
        },
        success: function (data, textStatus) {
          var articles = data.articles
          if (!articles || 0 === articles.length) {
            $('#externalRelevantArticles').remove()
            return
          }
          var listHtml = ''
          for (var i = 0; i < articles.length; i++) {
            var article = articles[i]
            var title = article.articleTitle
            var articleLiHtml = '<li>'
              + '<a rel=\'nofollow\' title=\'' + title +
              '\' target=\'_blank\' href=\'' + article.articlePermalink + '\'>'
              + title + '</a></li>'
            listHtml += articleLiHtml
          }

          var titleHTML = headTitle ? headTitle : '<h4>' +
            tips.externalRelevantArticles1Label + '</h4>'
          var randomArticleListHtml = titleHTML
            + '<ul>'
            + listHtml + '</ul>'
          $('#externalRelevantArticles').append(randomArticleListHtml)
        },
      })
    } catch (e) {
      // 忽略相关文章加载异常：load script error
    }
  },
  /*
   * @description 提交评论
   * @param {String} commentId 回复评论时的评论 id
   */
  submitComment: function () {
    var that = this,
      tips = this.tips

    if (vditor.getValue().length > 1 && vditor.getValue().length < 500) {
      $('#soloEditorAdd').attr('disabled', 'disabled')
      var requestJSONObject = {
        'oId': tips.oId,
        'commentContent': vditor.getValue(),
      }

      if (this.currentCommentId) {
        requestJSONObject.commentOriginalCommentId = this.currentCommentId
      }

      $.ajax({
        type: 'POST',
        url: Label.servePath + '/article/comments',
        cache: false,
        contentType: 'application/json',
        data: JSON.stringify(requestJSONObject),
        success: function (result) {
          $('#soloEditorAdd').removeAttr('disabled')
          if (!result.sc) {
            $('#soloEditorError').html(result.msg)
            return
          }
          that.toggleEditor()
          vditor.setValue('')
          that.addCommentAjax(result.cmtTpl)
        },
      })
    } else {
      $('#soloEditorError').text(that.tips.commentContentCannotEmptyLabel)
    }
  },
  /*
   * @description 隐藏回复评论的浮出层
   * @parma {String} id 被回复的评论 id
   */
  hideComment: function (id) {
    $('#commentRef' + id).hide()
  },
  /*
   * @description 显示回复评论的浮出层
   * @parma {Dom} it 触发事件的 dom
   * @param {String} id 被回复的评论 id
   * @param {Int} top 位置相对浮出层的高度
   * @param {String} [parentTag] it 如果嵌入在 position 为 relative 的元素 A 中时，需取到 A 元素
   */
  showComment: function (it, id, top, parentTag) {
    var positionTop = parseInt($(it).position().top)
    if (parentTag) {
      positionTop = parseInt($(it).parents(parentTag).position().top)
    }
    if ($('#commentRef' + id).length > 0) {
      // 此处重复设置 top 是由于评论为异步，原有回复评论的显示位置应往下移动
      $('#commentRef' + id).show().css('top', (positionTop + top) + 'px')
    } else {
      var $refComment = $('#' + id).clone()
      $refComment.addClass('comment-body-ref').attr('id', 'commentRef' + id)
      $refComment.find('#replyForm').remove()
      $('#comments').append($refComment)
      $('#commentRef' + id).css('top', (positionTop + top) + 'px')
    }
  },
  /*
   * @description 回复不刷新，将回复内容异步添加到评论列表中
   * @parma {String} commentHTML 回复内容 HTML
   */
  addCommentAjax: function (commentHTML) {
    if ($('#comments').children().length > 0) {
      $($('#comments').children()[0]).before(commentHTML)
    } else {
      $('#comments').html(commentHTML)
    }
    Util.parseMarkdown()
    window.location.hash = '#comments'
  },
})
