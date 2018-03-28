/*
 * @Author: xuce
 * @Date:   2017-12-09 18:13:58
 * @Last Modified by:   xuce
 * @Last Modified time: 2018-01-19 13:19:00
 */
import { TableRenderService } from "../render/tableRenderService.js"
import { SingleValueRenderService } from "../render/singleValueRenderService.js"
import { UtilService } from "../../utils/index"

(function(joint, _) {
  joint.shapes.html = {};
  /**
   * [Element description]
   * @type {[type]}
   */
  joint.shapes.html.Element = joint.shapes.basic.Generic.extend({
    markup: '<rect/>',
    defaults: _.defaultsDeep({
      type: 'html.Element',
      attrs: {
        rect: {
          'ref-width': '100%',
          'ref-height': '100%',
          'stroke': 'rgba(0,0,0,0)',
          // 'stroke': 'grey',
          'fill': 'rgba(0,0,0,0)'
        }
      }
    }, joint.shapes.basic.Generic.prototype.defaults)
  });
  /**
   * [ElementView]
   * @param  {[type]} )            {                                              this.listenTo(this.model, 'change', this.updateBox);    } [description]
   * @param  {[type]} onBoxChange: function(evt) {      var input [description]
   * @return {[type]}              [description]
   */
  joint.shapes.html.ElementView = joint.dia.ElementView.extend({
    template: [
      '<div class="joint-html-element">',
      '   <div class="db-table-handler db-table-hoverShow"></div>',
      '   <div class="db-table-title" data-attribute="title"></div>',
      '   <div>',
      '       <div class="db-table-content">',
      '           <div class="db-table-content-graphpanel">',
      '               <div class="db-table-content-graph"></div>',
      '           </div>',
      '       </div>',
      '   </div>',
      '   <div class="db-table-content-filterpanel">',
      '      <div>',
      '         <div class="db-table-content-filterpanel-form"></div>',
      '      </div>',
      '   </div>',
      '   <div class="db-table-settingPanel">',
      '       <ul>',
      '           <li class="db-table-settingPanel-li db-table-settingPanel-li-showTitle">',
      '               <a class="icon-cross-small"></a><h6>隐藏标题</h6>',
      '           </li>',
      '           <li class="db-table-settingPanel-li db-table-settingPanel-li-setTitleAlign">',
      '               <a class="icon-fast-forward"></a><h6>标题居中</h6>',
      '           </li>',
      '           <li class="db-table-settingPanel-li db-table-settingPanel-li-shareGraph">',
      '               <a class="icon-open"></a><h6>分享</h6>',
      '           </li>',
      '           <li class="db-table-settingPanel-li db-table-settingPanel-li-export">',
      '               <a class="icon-arrow-right-circle"></a><h6>导出</h6>',
      '           </li>',
      '           <li class="db-table-settingPanel-li db-table-settingPanel-li-showFilter">',
      '               <a class="icon-clipboard"></a><h6>查看过滤条件</h6>',
      '           </li>',
      '           <li class="db-table-settingPanel-li db-table-settingPanel-li-drill">',
      '               <a class="icon-zzz0032"></a><h6>钻取数据</h6>',
      '           </li>',
      '           <li class="db-table-settingPanel-li db-table-settingPanel-li-copy">',
      '               <a class="icon-zzcopy"></a><h6>复制</h6>',
      '           </li>',
      '           <li class="db-table-settingPanel-li db-table-settingPanel-li-delete">',
      '               <a class="icon-close"></a><h6>删除</h6>',
      '           </li>',
      '       </ul>',
      '   </div>',
      '   <div class="db-table-tool db-table-hoverShow">',
      '       <ul class="db-tool-nav">',
      '           <li>',
      '               <a class="paragraphShow icon-modification db-table-tool-edit" title="编辑"></a>',
      '           </li>',
      '           <li>',
      '               <a class="paragraphShow icon-expand db-table-tool-expand" title="全屏展示"></a>',
      '           </li>',
      '           <li>',
      '               <a class="paragraphShow icon-zzchoose db-table-tool-filter" title="设置过滤条件"></a>',
      '           </li>',
      '           <li>',
      '               <a class="paragraphShow icon-setting db-table-tool-setting" title="详细设置"></a>',
      '           </li>',
      '           <li>',
      '               <a class="paragraphShow icon-reload db-table-tool-reload" title="刷新"></a>',
      '           </li>',
      '   </div>',
      '</div>'
    ].join(''),
    /**
     * [init description]
     * @return {[type]} [description]
     */
    init: function() {
      // Update the box position whenever the underlying model changes.
      this.listenTo(this.model, 'change', this.updateBox);
      this.$vue = this.model.attributes.$vue;
      this.util = new UtilService();
      this.tableRenderService = new TableRenderService();
      this.graphSTBEventMap = this.GraphSettingToolBarEvent();
      this.graphToolBtnEvent = this.GraphToolBtnEvent();
      this.model.addDarkStyle = this.addDarkStyle.bind(this);
      this.model.removeDarkStyle = this.removeDarkStyle.bind(this);
    },
    /**
     * [onBoxChange description]
     * @param  {[type]} evt [description]
     * @return {[type]}     [description]
     */
    onBoxChange: function(evt) {
      var input = evt.target;
      var attribute = input.dataset.attribute;
      if (attribute) {
        this.model.set(attribute, input.value);
      }
    },
    /**
     * [onRender description]
     * @return {[type]} [description]
     */
    onRender: function() {
      var tableRenderService = new TableRenderService();

      if (this.$box) this.$box.remove();

      var boxMarkup = joint.util.template(this.template)();
      var $box = this.$box = $(boxMarkup);
      var g = this;

      this.$attributes = $box.find('[data-attribute]');
      this.listenTo(this.paper, 'scale', this.updateBox);
      $box.appendTo(this.paper.el);

      // 单值指标去掉title
      if (g.model.attributes.graphType === 'singlevalueindexfield') {
        g.model.attributes.isHideTitle = true;
        $box.find('.db-table-settingPanel-li-showTitle').remove();
        $box.find('.db-table-settingPanel-li-setTitleAlign').remove();
        $box.find('.db-table-settingPanel-li-export').remove();
        $box.find('.db-table-settingPanel-li-showFilter').remove();
        $box.find('.db-table-settingPanel-li-drill').remove();
        $box.find('.db-table-tool-expand').parent().remove();
        $box.find('.db-table-tool-filter').parent().remove();

        $box.find('.db-table-content').css({
          'pointer-events': 'none'
        });
        $box.find('.db-table-handler').remove();

      }


      if (g.model.attributes.isHideTitle) {
        $box.find('.db-table-title').hide();
        $box.find('.db-table-settingPanel-li-showTitle > a').addClass('icon-check');
        $box.find('.db-table-settingPanel-li-showTitle > h6').html('显示标题');
      }

      if (g.model.attributes.isTitleAlignCenter) {
        $box.find('.db-table-title').addClass('db-table-title-center');
        $box.find('.db-table-settingPanel-li-showTitle > a').addClass('icon-rewind');
        $box.find('.db-table-settingPanel-li-showTitle > h6').html('标题居左');
      }

      if (g.model.attributes.isShare) {
        $box.find('.db-tool-nav>li:eq(0)').remove();
        $box.find('.db-tool-nav>li:eq(2)').remove();
      }

      $box.find('.db-table-content').on('mouseover', function() {
        $(this).css({
          display: 'block'
        })
      });

      $box.attr('data-pid', this.model.id);

      // 渲染过滤面板
      this.renderFilterPanel();

      this.initEvent();
      this.renderTable(this.$box.find(".db-table-content-graph"), function() {
        this.updateBox();
      });

      return this;
    },
    /**
     * [updateBox description]
     * @return {[type]} [description]
     */
    updateBox: function() {
      var bbox = this.getBBox({ useModelGeometry: true });
      var scale = V(this.paper.viewport).scale();
      var height = bbox.height / scale.sy;
      var type = this.model.attributes.graphType;
      var conf = this.model.attributes.conf;
      this.$box.css({
        transform: 'scale(' + scale.sx + ',' + scale.sy + ')',
        transformOrigin: '0 0',
        width: bbox.width / scale.sx,
        height: bbox.height / scale.sy,
        left: bbox.x,
        top: bbox.y
      });
      //更新content容器高度
      if (this.model.attributes.isHideTitle) {
        // 判断是否为单指指标
        if (this.model.attributes.graphType === 'singlevalueindexfield') {
          this.$box.find('.db-table-content').height(height).css('margin-top', '0');
        } else {
          this.$box.find('.db-table-content').height(height - 13).css('margin-top', '10px');
        }
      } else {
        this.$box.find('.db-table-content').height(height - 31).css('margin-top', '0');
      }
      //更新属性值
      this.updateAttributes();
      // 目前支持的图表类型
      var chartTypes = ['rectangular', 'circle', 'singlevalueindexchart', 'radar'];

      if (type === "searchtable") {
        if (this.$box.find('.db-table-content-graph').data().f1Bigrid) {
          this.$box.find('.db-table-content-graph').bigrid('resize', {
            height: this.$box.find('.db-table-content-graphpanel').height(),
            width: this.$box.find('.db-table-content-graphpanel').width()
          });
        }
      } else if (type === "statable") {
        if (this.$box.find('.db-table-content-graph').data().f1Datastatgrid) {
          this.$box.find('.db-table-content-graph').datastatgrid('resize', {
            height: this.$box.find('.db-table-content-graphpanel').height(),
            width: this.$box.find('.db-table-content-graphpanel').width()
          });
        }
      } else if (_.indexOf(chartTypes, type) > -1) {
        // 由于echarts图表在创建实例前容器必须有尺寸，所以图表的渲染在父容器更新后执行
        try {
          if (this.chartInstance !== null && this.chartInstance !== undefined) {
            this.chartInstance.dispose();
            this.chartInstance = null;
          }
          this.chartOption = conf.paragraphCustomConfig.configs.chartOption || {};
          let $container = this.$box.find('.db-table-content-graph');
          let container = $container.get(0);
          let $parent = $container.parent();
          $container.width($parent.width()).height($parent.height());
          this.chartInstance = echarts.init(container);
          this.chartInstance.setOption(this.chartOption);
          this.chartInstance.resize();
        } catch (err) {
          console.warn(err);
        }

      }

      if (this.$vue.$store.state.dashboard.theme === 'dark') {
        this.addDarkStyle();
      } else {
        this.removeDarkStyle();
      }
    },

    /**
     * [updateAttributes description]
     * @return {[type]} [description]
     */
    updateAttributes: function() {
      var model = this.model;
      this.$attributes.each(function() {
        var value = model.get(this.dataset.attribute);
        $(this).text(value)
      });
    },
    /**
     * 移除
     */
    onRemove: function() {
      this.$box.remove();
    },
    /**
     * 初始化各种事件绑定
     */
    initEvent: function() {

      let g = this,
        $filterpanel = g.$box.find('.db-table-content-filterpanel');

      // 绑定handler和tools的显示和隐藏
      g.$box.mouseover(function() {
        $(this).find('.db-table-hoverShow').stop().fadeIn(250);
        $(this).addClass('joint-html-element-hover');
      }).mouseout(function() {
        $(this).find('.db-table-hoverShow').stop().fadeOut(250);
        $(this).removeClass('joint-html-element-hover');
      });

      // 绑定handler和tools的显示和隐藏
      g.$el.mouseover(function() {
        g.$box.find('.db-table-hoverShow').stop().fadeIn(250);
        g.$box.addClass('joint-html-element-hover');
      }).mouseout(function() {
        g.$box.find('.db-table-hoverShow').stop().fadeOut(250);
        g.$box.removeClass('joint-html-element-hover');
      });

      if (!g.model.attributes.isShare) {

        //绑定面板点击事件，触发矩形的选中和box的z-index提升
        g.$box.on('click', function() {
          let cell = g.model;

          $('.joint-html-element').removeClass('joint-html-element-higher');
          g.model.attributes.BIAppView.selection.collection.reset([g.model]);
          g.$box.addClass('joint-html-element-higher');

          if (cell.isElement()) {
            new joint.ui.FreeTransform({
              cellView: g,
              allowRotation: false,
              preserveAspectRatio: !!cell.get('preserveAspectRatio'),
              allowOrthogonalResize: cell.get('allowOrthogonalResize') !== false
            }).render();
          }
        });
      }

      // 绑定 工具条 点击事件
      g.$box.find('.db-table-tool').on('click', '.paragraphShow', function(e) {

        let $target = $(this),
          $delegateTarget = $(e.delegateTarget),
          btnType = $target[0].classList[2].split('-')[3];

        g.graphToolBtnEvent[btnType].call(g, $delegateTarget, e);
      });

      // 绑定 '详细设置' 列表点击事件
      g.$box.find('.db-table-settingPanel').on('click', '.db-table-settingPanel-li', function(e) {
        let $target = $(this),
          $delegateTarget = $(e.delegateTarget),
          btnType = $target[0].classList[1].split('-')[4];

        e.stopPropagation();
        g.graphSTBEventMap[btnType].call(g, $delegateTarget);
      });

    },
    /**
     * 渲染表格（满意）
     */
    renderTable: function($container, fn) {
      var $vue = this.model.attributes.$vue;
      var conf = this.model.attributes.conf;
      var type = this.model.attributes.graphType;
      var g = this;
      $vue.$store.state.graphData = (function() {
        var data = (!!conf.results && conf.results.code === "SUCCESS") ? conf.results.msg[0].data : "";
        return data;
      })();
      $vue.$store.state.dataviewOption = conf.dataView || {};
      $vue.$store.state.paragraph = conf;
      var paragraphId = this.model.id;
      let tableRenderService = new TableRenderService();
      let singlevalueindexfield = new SingleValueRenderService();
      if (type === "searchtable") {
        tableRenderService.renderDefaultSearchTable($vue, $container, paragraphId);
      } else if (type === "statable") {
        tableRenderService.renderDefaultStatTable($vue, $container, paragraphId);
      } else if (type === "singlevalueindexfield") {
        singlevalueindexfield.renderDefaultSingleValue($vue, $container, paragraphId);
      }
      // 执行回调
      fn.call(g);
    },
    /**
     * 显然 过滤条件设置 面板
     */
    renderFilterPanel: function() {
      let g = this,
        $box = g.$box,
        $filterPanel = $box.find('.db-table-content-filterpanel'),
        $filterForm = $filterPanel.find('.db-table-content-filterpanel-form'),
        $queryBtn = $('<a class="icon-search db-table-filterpanel-querybtn"></a>');

      let _stopPropagation = function() {
        // 修正一系列的下拉框的事件冒泡的阻止
        $('.l-box-dateeditor').off('click').on('click', function(e) {
          e.stopPropagation();
        });
        $('.l-box-select').off('click').on('click', function(e) {
          e.stopPropagation();
        });
      };

      $filterForm.formpanel({
        labelWidth: 50,
        inputWidthp: 0.70,
        items: [{
          type: "textfield",
          id: "searchText",
          rowspan: 2,
          label: "关键字"
        }, {
          type: "combofield",
          id: "timeRange",
          label: "时间段",
          rowspan: 2,
          allowInput: false,
          data: [{
            id: moment.duration(1, 'hours').asMilliseconds(),
            text: "最近1小时",
          }, {
            id: moment.duration(4, 'hours').asMilliseconds(),
            text: "最近4小时",
          }, {
            id: moment.duration(12, 'hours').asMilliseconds(),
            text: "最近12小时",
          }, {
            id: moment.duration(1, 'days').asMilliseconds(),
            text: "最近24小时",
          }, {
            id: moment.duration(7, 'days').asMilliseconds(),
            text: "最近7天",
          }, {
            id: moment.duration(30, 'days').asMilliseconds(),
            text: "最近30天",
          }, {
            id: moment.duration(60, 'days').asMilliseconds(),
            text: "最近60天",
          }, {
            id: "custom",
            text: "自定义",
          }],
          value: "",
          onSelected: function(e, args) {
            $filterForm.formpanel('findById', 'startTime').setValue('');
            $filterForm.formpanel('findById', 'endTime').setValue('');
          }
        }, {
          rowspan: 2,
          type: "datefield",
          id: "startTime",
          label: "开始时间",
          allowInput: false,
          value: "",
          change: function() {
            $filterForm.formpanel('findById', 'timeRange').setValue('custom');
          }
        }, {
          rowspan: 2,
          type: "datefield",
          id: "endTime",
          label: "结束时间",
          allowInput: false,
          value: "",
          change: function() {
            $filterForm.formpanel('findById', 'timeRange').setValue('custom');
          }
        }]
      });

      $queryBtn.on('click', function() {
        //  @TODO 查询操作
        let searchMsg = $filterForm.formpanel('findById', 'searchText').getValue(),
          startTime = $filterForm.formpanel('findById', 'startTime').getValue(),
          endTime = $filterForm.formpanel('findById', 'endTime').getValue(),
          timeRnage = $filterForm.formpanel('findById', 'timeRange').getValue(),
          oldText = g.$vue.$store.getters.getParagraphById(g.model.id).value.paragraphCustomConfig.configs.text,
          interperterName = oldText.substr(1, oldText.indexOf('\n') - 1),
          searchText, dataObj;

        // 修正startTime 和 endTime
        if (timeRnage && timeRnage !== 'custom') {
          startTime = (Number(moment().format("x")) - Number(timeRnage)).toString();
          endTime = moment().format("x");
        } else {
          startTime = moment(startTime).format("x");
          endTime = moment(endTime).format("x");
        }

        // @TODO 当前type写死为elasticsearch
        dataObj = {
          startTime: startTime,
          endTime: endTime,
          selectInterpreterText: interperterName,
          size: g.$vue.$store.getters.getParagraphById(g.model.id).value.paragraphCustomConfig.configs.pageSize,
          type: "elasticsearch",
          queryText: searchMsg
        };

        searchText = g.util.getLogstashText(dataObj);

        g.$vue.$store.dispatch({
          type: 'getGraphData',
          noteId: g.model.attributes.noteId,
          paragraphId: g.model.id,
          text: searchText
        }).then(function(response) {
          g.tableRenderService.renderDefaultSearchTable(g.$vue, $box.find(".db-table-content-graph"), g.model.id);
        })

      });

      $filterForm.append($queryBtn);

    },
    /**
     * 每个graph的工具条事件集合
     * @return {Map}
     * @constructor
     */
    GraphSettingToolBarEvent: function() {
      let eventMap = Object.create(null);

      // 隐藏\显示标题 按钮点击事件
      eventMap['showTitle'] = function($delegateTarget) {
        let g = this,
          $target = $delegateTarget.find('.db-table-settingPanel-li-showTitle'),
          $jointElement = $delegateTarget.parents('.joint-html-element'),
          _$a = $target.find('a'),
          _$h6 = $target.find('h6'),
          _$title = $jointElement.find('.db-table-title'),
          _index = g.$vue.$store.getters.getParagraphById(g.model.attributes.id).index;

        if (_$a.hasClass('icon-check')) {
          // 显示标题操作
          if (_index || _index === 0) {
            g.$vue.$store.state.dashboard.paragraphs[_index].config.isHideTitle = false;
            g.model.attributes.isHideTitle = false;
          }
          _$title.show();
          _$a.removeClass('icon-check');
          _$h6.html('隐藏标题');
          g.updateBox();
        } else {
          // 隐藏标题操作
          if (_index || _index === 0) {
            g.$vue.$store.state.dashboard.paragraphs[_index].config.isHideTitle = true;
            g.model.attributes.isHideTitle = true;
          }
          _$title.hide();
          _$a.addClass('icon-check');
          _$h6.html('显示标题');
          g.updateBox();
        }
      };

      // 标题位置 按钮点击事件
      eventMap['setTitleAlign'] = function($delegateTarget) {
        let g = this,
          $target = $delegateTarget.find('.db-table-settingPanel-li-setTitleAlign'),
          $jointElement = $delegateTarget.parents('.joint-html-element'),
          _$a = $target.find('a'),
          _$h6 = $target.find('h6'),
          _$title = $jointElement.find('.db-table-title'),
          _index = g.$vue.$store.getters.getParagraphById(g.model.attributes.id).index;

        if (_$a.hasClass('icon-rewind')) {
          if (_index || _index === 0) {
            g.$vue.$store.state.dashboard.paragraphs[_index].config.isTitleAlignCenter = false;
            g.model.attributes.isTitleAlignCenter = false;
          }
          _$title.removeClass('db-table-title-center');
          _$a.removeClass('icon-rewind');
          _$h6.html('标题居左');
        } else {
          // 隐藏标题操作
          if (_index || _index === 0) {
            g.$vue.$store.state.dashboard.paragraphs[_index].config.isTitleAlignCenter = true;
            g.model.attributes.isTitleAlignCenter = true;
          }
          _$title.addClass('db-table-title-center');
          _$a.addClass('icon-rewind');
          _$h6.html('标题居中');
        }
        g.updateBox();
      };

      // 导出 按钮点击事件
      eventMap['export'] = function() {

      };

      // 单图分享 按钮点击事件
      eventMap['shareGraph'] = function() {
        window.open(window.basePath + window.location.pathname.substring(1) + '#/share/' + this.$vue.$route.params.nid + '/' + this.model.id)
      };

      // 查看过滤条件 按钮点击事件
      eventMap['showFilter'] = function() {

      };

      // 钻取数据 按钮点击事件
      eventMap['drill'] = function() {

      };

      // 复制 按钮点击事件
      eventMap['copy'] = function() {

      };

      // 删除 按钮点击事件
      eventMap['delete'] = function($delegateTarget) {
        let g = this;

        artDialog.confirm('确认删除？', function() {
          g.$vue.$store.dispatch({
            type: 'deleteGraph',
            nId: g.$vue.$route.params['nid'],
            pId: g.model.attributes.id
          }).then(function(response) {
            g.$box.remove();
            g.$el.remove();
            g.model.attributes.BIAppView.graph.removeCells([g.model]);
          })
        }, $.noop(), {
          lock: true
        });

      };

      return eventMap
    },
    /**
     * 每个graph的四个工具按钮事件集合
     */
    GraphToolBtnEvent: function() {
      let tbEventMap = Object.create(null);

      // '详细设置'按钮
      tbEventMap['setting'] = function($delegateTarget, e) {
        let g = this,
          $jointElement = $delegateTarget.parents('.joint-html-element'),
          $settingPanel = $jointElement.find('.db-table-settingPanel');

        $settingPanel.show();
        e.stopPropagation();
        $('body').on('click', function(e) {
          $('body').off('click');
          $settingPanel.hide();
        })
      };

      // '编辑'按钮
      tbEventMap['edit'] = function($delegateTarget, e) {
        let g = this;
        let $vue = g.model.attributes.$vue;
        let noteId = g.model.attributes.noteId;
        let paragraphId = g.model.attributes.id;
        let conf = g.model.attributes.conf;
        let _url = '/dashboard/{0}/canvas/setting/{1}';
        //构造表格模
        let data = g.$vue.$store.getters.getParagraphData(paragraphId);
        $('#dashboard-graphsetting-container').removeClass('dashboard-mask-hidden');
        $('.dashboard-mask').removeClass('dashboard-mask-hidden').find('.dashboard-mask-close').addClass('dashboard-mask-hidden');
        g.$vue.$router.push(String.format(_url, noteId, paragraphId));
      };

      // '全屏展示'按钮
      tbEventMap['expand'] = function($delegateTarget, e) {
        let g = this,
          $container = $('#dashboard-expand-container'),
          $box = $container.find('#dashboard-expand-box'),
          type = g.model.attributes.graphType,
          chartInstanceForView = echarts.getInstanceByDom($box[0]) || {};

        $('.dashboard-mask').removeClass('dashboard-mask-hidden');
        $container.removeClass('dashboard-mask-hidden');

        $box.empty();
        $container.empty().append($box);

        // 如果是预览图表，则复制当前dom去显示

        if (['rectangular', 'circle', 'singlevalueindexchart', 'radar'].indexOf(type) !== -1) {
          if (chartInstanceForView && chartInstanceForView.dispose) {
            chartInstanceForView.dispose();
            chartInstanceForView = null;
          }

          chartInstanceForView = echarts.init($box[0]);

          if (g.$vue.$store.state.dashboard.theme === 'dark') {
            chartInstanceForView._theme = chartInstanceForView._themeStorage['dark_new'];
          } else {
            chartInstanceForView._theme = chartInstanceForView._themeStorage['light_new'];
          }

          chartInstanceForView.setOption(g.chartOption);
          chartInstanceForView.resize();
        }

        g.renderTable($box, function() {
          if (g.$vue.$store.state.dashboard.theme === 'dark') {
            this.addDarkStyle($container);
            $container.css('background-color', '#011A31');
          } else {
            this.removeDarkStyle($container);
            $container.css('background-color', 'white');
          }
        });
      };

      // '过滤条件'按钮
      tbEventMap['filter'] = function($delegateTarget, e) {
        let g = this,
          $jointElement = $delegateTarget.parents('.joint-html-element'),
          $filterPanel = $jointElement.find('.db-table-content-filterpanel');

        e.stopPropagation();

        if ($filterPanel.css('display') === 'none') {
          $filterPanel.show();
          $filterPanel.off('click').on('click', function(e) {
            e.stopPropagation();
          });
          $('body').on('click', function(e) {
            let $target = $(e.target);
            if ($target.parents('.l-box-select').length === 0 && $target.parents('.l-box-dateeditor').length === 0) {
              $('body').off('click');
              $filterPanel.hide();
            }
          })
        }
      };

      // '刷新'按钮
      tbEventMap['refresh'] = function ($delegateTarget, e) {
        let g = this;
        // 获取新的图表配置项
        let nid,
            pid;
        let promiseUpdateParagraph = g.updateParagraph(nid, pid);
        // 重新渲染图表
        promiseUpdateParagraph.then(function() {

        });
      };

      return tbEventMap;
    },
    /*
    * TODO: 函数定义的位置是否需要更改
    * 更新图表的配置项数据
    * @param nid noteID
    * @param pid paragraphID
    * @return {Promise} 请求图表数据生成的Promise对象
    * */
    updateParagraph: function(nid, pid) {
      let g = this;
      let promiseParagraphData = this.$vue.state.dispatch({
        type: 'getParagraphDate',
        noteId: nid,
        paragraphId: pid
      }).then(function(result) {
        let newParagraph;
        return newParagraph;
      });

      return promiseParagraphData;
    },
    /**
     * 添加暗色主题
     */
    addDarkStyle: function($box) {
      let g = this;
      $box = $box || this.$box;

      if (!$box) {
        return false;
      }

      $box.find('.db-table-title').addClass('title-background-color-dark');

      if (this.chartInstance) {
        this.chartInstance._theme = this.chartInstance._themeStorage['dark_new'];
        this.chartInstance.setOption(this.chartOption, true);
      } else {
        $box.find('.db-table-title').addClass('title-background-color-dark');
        $box.find('.datagrid-header').addClass('datagrid-header-dark');
        $box.find('.datagrid-footer').addClass('datagrid-footer-dark');
        $box.find('.datagrid-body').addClass('datagrid-body-dark');
        $box.find('.datagrid-row-over').addClass('datagrid-row-over-dark');
      }

      if (this.model.attributes.isShare) {
        $box.find('.db-table-handler').addClass('db-table-handler-share');
      } else {
        $box.find('.db-table-handler').addClass('db-table-handler-dark');
      }

    },
    /**
     * 移除暗色主题样式
     * @param $box
     */
    removeDarkStyle: function($box) {
      let g = this;
      $box = $box || this.$box;

      if (!$box) {
        return false;
      }

      if (this.chartInstance) {
        this.chartInstance._theme = this.chartInstance._themeStorage['light_new'];
        this.chartInstance.setOption(this.chartOption, true);
      } else {
        $box.find('.db-table-title').removeClass('title-background-color-dark');
        $box.find('.datagrid-header').removeClass('datagrid-header-dark');
        $box.find('.datagrid-footer').removeClass('datagrid-footer-dark');
        $box.find('.datagrid-body').removeClass('datagrid-body-dark');
        $box.find('.datagrid-row-over').removeClass('datagrid-row-over-dark');
      }

      if (this.model.attributes.isShare) {
        $box.find('.db-table-handler').addClass('db-table-handler-share');
      }

    }

  });
})(joint, _);
