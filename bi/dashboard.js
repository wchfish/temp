require('./components/BIFrameView.js');
require('./components/BIHtmlElement.js');
require('../style/dashboard.styl');
require('../style/canvastheme/blue.styl');
require('../style/canvastheme/dark.styl');

import {
  macScrollPanel
} from '../plugins/macScrollPanel/MacScrollPanel.js';

/*
 * @Author: xuce
 * @Date:   2017-12-09 15:57:13
 * @Last Modified by:   xuce
 * @Last Modified time: 2018-01-24 17:42:43
 */
class DashboardService {
  /**
   * 构造方法
   * @return {[type]} [description]
   */
  constructor(params) {
    this.selectStr = params.selectStr;
    this.isShare = params.isShare || false;
    this.isSingle = params.isSingle || false;
    this.pId = params.pId || '';
  };

  /**
   * 构造画布
   * @param  {[type]} $vue [description]
   * @return {[type]}      [description]
   */
  buildCanvas($vue) {
    let $container,
      dashboard = $vue.$store.state.dashboard,
      $canvasContainer = $(this.selectStr);

    // 构建mac滚动条
    macScrollPanel($canvasContainer);
    $container = $canvasContainer.find('.msp-container');

    // 初始话画布宽高和类型
    dashboard.layoutType = dashboard.layoutType || 'fit';
    dashboard.canvasHeight = dashboard.canvasHeight || $canvasContainer.height();
    dashboard.canvasWidth = dashboard.canvasWidth || $canvasContainer.width();

    //构造画布
    this.BIAppView = new joint.f1.BIFrameView({
      canvasHeight: dashboard.layoutType === 'fit' ? '' : dashboard.canvasHeight,
      canvasWidth: dashboard.layoutType === 'fit' ? $canvasContainer.width() : dashboard.canvasWidth,
      layoutType: dashboard.layoutType,
      paperEl: $container,
      isShare: this.isShare,
      vue: $vue
    });

    //绑定拖拽事件
    if (!this.isShare) {
      this.bindDrop($vue);
    }
    //绘制画图
    if (!this.isSingle) {
      this.drawParagraph($vue, this.pId);
    } else {
      this.drawParagraph($vue);
    }
    // 设置背景图
    this.setCanvasBackgroundImage($vue);
    // 网格布局
    if (dashboard.layoutType === 'fit') {
      dashboard.canvasWidth = $canvasContainer.width() + '';
      dashboard.canvasHeight = '';
      $container.addClass('dashboard-canvas-fit');
    }

    // 给全屏预览关闭按钮添加点击事件
    $('.dashboard-mask-close').click(function() {
      $('#dashboard-expand-box').empty();
      $('#dashboard-expand-container').addClass('dashboard-mask-hidden');
      $('.dashboard-mask').addClass('dashboard-mask-hidden');
    });

  };

  /**
   * 绑定拖转事件
   * @param  {[type]} $vue [description]
   * @return {[type]}      [description]
   */
  bindDrop($vue) {
    var g = this;
    /**
     * 绑定拖动事件
     * @type {[type]}
     */
    $("a.dragATag").draggable({
      appendTo: document.body,
      helper: "clone"
    });
    /**
     * 绑定放事件
     * @param  {[type]} event [description]
     * @param  {[type]} ui)   {                   var _viewtype [description]
     * @return {[type]}       [description]
     */
    $('div.joint-paper').droppable({
      /**
       * 放下事件
       * @param  {[type]} event [description]
       * @param  {[type]} ui    [description]
       * @return {[type]}       [description]
       */
      drop: function(event, ui) {

        let _viewtype = ui.helper.attr('view-type'),
          _top = ui.position.top - 95 - $(this).offset().top,
          _left = ui.position.left - 129 - $(this).offset().left,
          _canvasHeight = $(this).height(),
          _canvasWidth = $(this).width(),
          _height = 320,
          _width = 240,
          data = Object.create(null);

        // 纠正left和top
        _top = (_top < 0 ? 0 : _top);
        _top = (_top > (_canvasHeight - 97) ? (_canvasHeight - 95) : _top);
        _left = (_left < 0 ? 0 : _left);
        _left = (_left > (_canvasWidth - 131) ? (_canvasWidth - 129) : _left);

        //插入数据
        data = {
          'paragraph': {
            "index": 0,
            "title": "",
            "text": "",
            "config": {
              y: _top,
              x: _left,
              colWidth: _width,
              colHeight: _height
            }
          },
          'paragraphCustomConfig': {
            type: _viewtype
          }
        };

        //插入图形数据
        $vue.$store.dispatch({
          type: 'insertParagraph',
          params: {
            'noteId': $vue.$route.params['nid'],
            'paragraph': data.paragraph,
            'paragraphCustomConfig': data.paragraphCustomConfig
          }
        }).then(function(response) {

          let url = '/dashboard/{0}/canvas/setting/{1}';
          // let noteId = $vue.$route.params.nid;
          // let paragraphId = response.data.body.id;

          //重新载入最新数据
          $vue.$store.dispatch({
            type: 'getDashboard',
            params: {
              'nid': $vue.$route.params['nid']
            }
          });

          $('#dashboard-graphsetting-container').removeClass('dashboard-mask-hidden');
          $('.dashboard-mask').removeClass('dashboard-mask-hidden').find('.dashboard-mask-close').addClass('dashboard-mask-hidden');
          $vue.$store.state.dashboard.paragraphs.push(response.data.body);
          let paragraphId = response.data.body.id;

          let data = $vue.$store.getters.getParagraphData(paragraphId);
          let noteId = $vue.$route.params.nid;
          $vue.$router.push(String.format(url, noteId, paragraphId));
        })
      }
    });
  };

  insertParagraph() {

  };
  /**
   * 锁定
   * @param  {[type]} $vue      [description]
   * @param  {[type]} successFn [description]
   * @param  {[type]} faultFn   [description]
   * @return {[type]}           [description]
   */
  lock($vue, successFn, faultFn) {
    //noteId
    var nid = $vue.$route.params['nid'];
    //请求锁定
    $vue.$store.dispatch({ type: 'releaseVersion', params: { nid: nid } }).then(function(e, args) {
    });
  };
  /**
   * [save description]
   * @param  {[type]} $vue [description]
   * @param successFn 保存成功的回调
   * @param faultFn 保存失败的回调
   * @return {[type]}      [description]
   */
  save($vue, successFn, faultFn) {
    var cells = this.BIAppView.getCells() || [];
    //结果集
    var result = $.extend($vue.$store.state.dashboard, {
      canvasImage: '',
      paragraphs: []
    });

    //循环添加对象
    $.each(cells, function(index, cell) {
      var attributes = cell.attributes || {};
      var paragraph = {
        x: attributes.position.x,
        y: attributes.position.y,
        colWidth: attributes.size.width,
        colHeight: attributes.size.height,
        paragraphId: cell.id,
        isHideTitle: !!attributes.isHideTitle,
        isTitleAlignCenter: !!attributes.isTitleAlignCenter
      };
      result.paragraphs.push(paragraph);
    });
    var nid = $vue.$route.params['nid'];
    //保存更新
    $vue.$store.dispatch({
      type: 'updateDashboard',
      params: {
        data: result,
        nid: nid
      }
    }).then(function(response) {
      if (response && response.data.status === 'OK') {
        if (successFn) successFn();
        else artDialog.tips('保存成功');
        //重新载入最新数据
        $vue.$store.dispatch({
          type: 'getDashboard',
          params: {
            'nid': nid
          }
        });
      } else {
        if (faultFn) faultFn();
        else artDialog.tips('保存失败！');
      }
    });
  }

  /**
   * 绘制画图板
   * @param  {[type]} $vue [description]
   * @param  pid
   * @return {[type]}      [description]
   */
  drawParagraph($vue, pid) {
    //获取原始数据
    let dashboard = $vue.$store.state.dashboard,
      elements = [],
      g = this;

    //循环添加
    $.each(dashboard.paragraphs, function(index, item) {
      let config = item.config || {},
        scaleNumber = dashboard.layoutType === 'fit' ? g.getScaleNumber($vue) : 1;

      // 根据缩放比例修正graph的宽高
      if (!pid) {
        dashboard.paragraphs[index].config.x = parseInt(config.x * scaleNumber);
        dashboard.paragraphs[index].config.colWidth = parseInt(config.colWidth * scaleNumber);
      } else if (pid && item.id === pid) {
        // 单图分享的时候
        let $container = $(g.selectStr).find('.msp-container');
        g.BIAppView.paper.options.editMode = 'fixed';
        g.BIAppView.paper.$el.removeClass('dashboard-canvas-fit');
        $vue.$store.state.dashboard.layoutType = 'fixed';
        dashboard.paragraphs[index].config.x = 0;
        dashboard.paragraphs[index].config.y = 0;
        dashboard.paragraphs[index].config.colWidth = $container.width() - 0;
        dashboard.paragraphs[index].config.colHeight = $container.height() - 5;
      } else {
        return;
      }
      let htmlelement = new joint.shapes.html.Element({
        id: item.id,
        position: {
          x: dashboard.paragraphs[index].config.x,
          y: dashboard.paragraphs[index].config.y
        },
        size: {
          width: dashboard.paragraphs[index].config.colWidth,
          height: dashboard.paragraphs[index].config.colHeight
        },
        title: item.title || '',
        graphType: !!item.paragraphCustomConfig ? item.paragraphCustomConfig.type : "",
        $vue: $vue,
        isHideTitle: !!config.isHideTitle,
        isTitleAlignCenter: !!config.isTitleAlignCenter,
        conf: item,
        theme: $vue.$store.state.dashboard.theme || 'blue',
        isShare: g.isShare,
        noteId: dashboard.id,
        BIAppView: g.BIAppView
      });
      if (!pid || item.id === pid) {
        elements.unshift(htmlelement);
      }
    });
    //新增元素
    // 原方法
    this.BIAppView.addCells(elements);
    // var _self = this;
    // // 异步方法
    // utilService.chunk(elements, _self.BIAppView.graph.addCell, _self.BIAppView.graph, function() {
    //   // clearInterval(interval);
    //   $vue.nprogress.done();
    //   $vue.nprogress.remove();
    // });

    // 同步方法
    // _.forEach(elements, function(item, index) {
    //   $vue.nprogress.inc();
    //   _self.BIAppView.graph.addCell(item);
    // });
    // $vue.nprogress.done();

    // 判断是否为dark主题
    if (dashboard.theme === 'dark') {
      g.addDarkStyle();
    } else {
      g.removeDarkStyle()
    }

  }

  /**
   * 修改画布布局类型（fit 或者 fixed）
   * @param $vue
   * @return {boolean}
   */
  changeLayoutType($vue) {
    var dashboard = $vue.$store.state.dashboard || {};
    var layoutType = dashboard.layoutType || '';

    if (!layoutType || !this.BIAppView) {
      return false;
    }

    this.BIAppView.paper.options.editMode = layoutType;

    let $el = this.BIAppView.paper.$el;
    let parent = $el.parent();
    let w = dashboard.canvasWidth,
      h = dashboard.canvasHeight;

    if (layoutType === 'fixed') {
      $el.removeClass('dashboard-canvas-fit');
      this.changeCanvasSize(h, w)
    } else {
      $el.addClass('dashboard-canvas-fit');
      dashboard.canvasWidth = $(this.selectStr).width();
      w = parent.width();
      this.changeCanvasSize(0, w)
    }
  }

  /**
   *  修改画布大小
   * @param h
   * @param w
   */
  changeCanvasSize(h, w) {
    if (w && this.BIAppView) {
      h = parseInt(h);
      w = parseInt(w);
      this.BIAppView.paper.setDimensions(w, (h === 0) ? '' : h);
      this.BIAppView.paper.$el.css({
        width: w + 'px',
        height: (h === 0) ? 'auto' : (h + 'px')
      });
    }
  }

  /**
   * 设置画布背景图
   * @param $vue
   */
  setCanvasBackgroundImage($vue) {

    if (!this.BIAppView) {
      return false
    }

    let dashboard = $vue.$store.state.dashboard || {};
    let _noteId = dashboard.id;

    this.BIAppView.paper.$el.css({
      'background': 'none',
      'background-size': '100% 100%'
    });

    if (dashboard.backGroundUrl && dashboard.backGroundUrl !== 'none') {
      this.BIAppView.paper.$el.css({
        'background': 'url(' + basePath + 'api/notebook/upload/' + _noteId + '/background) ',
        'background-size': '100% 100%'
      });
    }

  };

  /**
   * 获取缩放的比例
   */
  getScaleNumber($vue) {
    let dashboard = $vue.$store.state.dashboard,
      $canvasContainer = $(this.selectStr),
      oldWidth = dashboard.canvasWidth || $canvasContainer.width();
    return parseInt($canvasContainer.width()) / parseInt(oldWidth);
  }

  /**
   * 添加dark样式
   */
  addDarkStyle() {
    let g = this,
      cells = g.BIAppView.graph.getCells();

    $('.joint-paper').addClass('canvas-background-color-dark');
    $('.db-table-title').addClass('title-background-color-dark');
    $('.msp-scrollBar').addClass('msp-scrollBar-dark');

    cells.forEach(function(val, index, array) {
      val.addDarkStyle()
    });
  }

  /**
   * 移除dark样式
   */
  removeDarkStyle() {
    let g = this,
      cells = g.BIAppView.graph.getCells();

    $('.joint-paper').removeClass('canvas-background-color-dark');
    $('.db-table-title').removeClass('title-background-color-dark');
    $('.msp-scrollBar').removeClass('msp-scrollBar-dark');

    cells.forEach(function(val) {
      val.removeDarkStyle()
    });

  }

  /**
   * 开启网状线画布编辑模式
   */
  showGridEditor() {
    let g = this;
    $('.joint-html-element').addClass('joint-html-element-grideditor');
    g.BIAppView.paper.options.drawGrid = true;
    $(g.BIAppView.paper.svg).addClass('joint-theme-default-gridEditor');
  }

  /**
   * 关闭网状线画布编辑模式
   */
  removeGridEditor() {
    let g = this;
    $('.joint-html-element').removeClass('joint-html-element-grideditor');
    g.BIAppView.paper.options.drawGrid = false;
    $(g.BIAppView.paper.svg).removeClass('joint-theme-default-gridEditor');
  }

  /**
   * 新增一个graph
   */
  addGraph($vue, nid, pid) {
    let g = this;

    $vue.$store.dispatch({
      type: 'getParagraphData',
      noteId: nid,
      paragraphId: pid
    }).then(function(result) {
      let resultGetParagraphById = $vue.$store.getters.getParagraphById(pid) || {},
        graph = resultGetParagraphById.value || null,
        index = resultGetParagraphById.index,
        _dashboard = $vue.$store.state.dashboard,
        currentCell = g.BIAppView.getCellById(pid);

      if (!result) {
        console.error('graph加载失败！');
        return false;
      }

      if (!currentCell) {
        // 不存在 则为新增
        _dashboard.paragraphs[0] = result;
      } else {
        // 存在，根据index修改
        let attributes = currentCell.attributes || {},
          cellSize = attributes.size || {},
          cellPosition = attributes.position || {},
          isTitleAlignCenter = !!attributes.isTitleAlignCenter,
          isHideTitle = !!attributes.isHideTitle;
        // 在这里修正cell的位置和大小（这里应该是当前编辑过后的，不是从后台取出来的）
        _dashboard.paragraphs[index] = $.extend(true, result, {
          config: {
            colHeight: cellSize.height || 320,
            colWidth: cellSize.width || 240,
            x: cellPosition.x || 0,
            y: cellPosition.y || 0,
            isTitleAlignCenter: isTitleAlignCenter,
            isHideTitle: isHideTitle
          }
        });
        g.BIAppView.graph.removeCells([currentCell]);
      }

      // 新建cell实例
      let htmlcell = new joint.shapes.html.Element({
        id: result.id,
        position: {
          x: result.config.x,
          y: result.config.y
        },
        size: {
          width: result.config.colWidth,
          height: result.config.colHeight
        },
        title: result.title || '',
        graphType: !!result.paragraphCustomConfig ? result.paragraphCustomConfig.type : "",
        $vue: $vue,
        isHideTitle: !!result.config.isHideTitle,
        isTitleAlignCenter: !!result.config.isTitleAlignCenter,
        conf: result,
        theme: $vue.$store.state.dashboard.theme || 'blue',
        isShare: g.isShare,
        noteId: $vue.$route.params['nid'],
        BIAppView: g.BIAppView
      });

      // 新增cell并默认选中
      g.BIAppView.graph.addCell(htmlcell);
      g.BIAppView.selection.cancelSelection();
      g.BIAppView.selection.collection.reset([htmlcell]);

      // 如果当前为网格编辑状态,增加cell的边线
      if ($vue.isGridVisiable) {
        $('.joint-html-element').addClass('joint-html-element-grideditor');
      }


    })
  }

}

/**
 *导出对象
 */
export {
  DashboardService
};
