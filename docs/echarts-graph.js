'use strict'

const GOOD_COLORS = [
  '#98e61f',
  '#8045df',
  '#d7c315',
  '#13d8e3',
  '#af18df',
  '#4d3dfe',
  '#c2f746',
  '#ef3a62',
  '#4ef60a',
  '#ce0d2c',
  '#237efc',
  '#45bde4',
  '#6302fe',
  '#c7d740',
  '#3f6ae8',
  '#4098f7',
  '#2912f3',
  '#7907d1',
  '#d00daa',
  '#8af64b',
  '#4911cd',
  '#0dfdd7',
  '#f81135',
  '#fa08db',
  '#4bd694',
  '#cef10c',
  '#2ed445',
  '#fd4ad5',
  '#79fc0b',
  '#fdaa49',
  '#12e0a3',
  '#e64b98',
  '#09db36',
  '#fe2608',
  '#042efe',
  '#212dce',
  '#d536f2',
  '#37dac1',
  '#e83f08',
  '#d06b48',
  '#3beafc',
  '#f928c4',
  '#fb7107',
  '#65da1b',
  '#2ce515',
  '#f8d402',
  '#4afc6f',
  '#0e4cdb',
  '#d59945',
  '#f5d64a',
  '#abd501',
  '#02f50a',
  '#f0009d',
  '#2ffc92',
  '#0110dc',
  '#00b7dc',
  '#01f949',
  '#cf5a16',
  '#d231a9',
  '#9f30fb',
  '#f08348',
  '#0ea0ff',
  '#0267e8',
  '#a748d8',
  '#d09708',
  '#f7b208',
  '#fd920b',
  '#de16f9',
  '#fa0000',
  '#fb2187',
  '#19d36e',
  '#29fd3f',
  '#ed0161',
  '#cd464e',
  '#6e25fe',
  '#4cfbd3',
  '#ce1f5e',
  '#d6bc4c',
  '#55e94a',
  '#a0cd44',
  '#02fa88',
  '#fa5845',
  '#21a4ce',
  '#f7fd25'
]
const dom = document.getElementById('graph')
const chart = echarts.init(dom)
let option = null
let catalog = null
let catalogLinks = null
let catalogData = null
const app = {}

chart.showLoading()
function onData (data) {
  catalog = data
  let nextColor = 0
  const colors = {}
  console.log(catalog)

  // Count the number of incoming and outgoing edges
  const incoming = {}
  const outgoing = {}
  catalog.edges.forEach(edge => {
    if (edge.target in incoming) {
      incoming[edge.target]++
    } else {
      incoming[edge.target] = 1
    }
    if (edge.source in outgoing) {
      outgoing[edge.source]++
    } else {
      outgoing[edge.source] = 1
    }
  })

  catalogLinks = catalog.edges.map((edge, idx) => {
    return {
      id: idx,
      name: null,
      source: catalog.nodes[edge.source].nodeName,
      target: catalog.nodes[edge.target].nodeName
    }
  })
  console.log(catalogLinks)
  catalogData = catalog.nodes.map((node, index) => {
    // Scale node size based on # of incoming edges
    let size = incoming[index]
    size = isNaN(size) ? 10 : 5 * Math.log(size) + 10

    // Assign a color to the node based on the group
    if (!(node.group in colors)) {
      colors[node.group] = GOOD_COLORS[nextColor++]
    }

    return {
      id: node.nodeName,
      name: `${node.nodeName}: ${node.fullName}`,
      symbolSize: size,
      value: null,
      category: node.group,
      // Use random x, y
      x: Math.random() * 100,
      y: Math.random() * 100,
      draggable: true,
      itemStyle: {
        color: colors[node.group]
      }
    }
  })
  updateOptions(catalogData, catalogLinks)
}

function updateOptions (data, links) {
  chart.hideLoading()
  option = {
    title: {
      text: 'UCR Course Depencency Graph (Winter 2020)'
    },
    layout: 'force',
    animationDurationUpdate: 1500,
    animationEasingUpdate: 'quinticInOut',
    series: [
      {
        type: 'graph',
        // layout: 'force',
        layout: 'circular',
        edgeSymbol: ['none', 'arrow'],
        edgeSymbolSize: 5,
        data,
        links,
        emphasis: {
          label: {
            position: 'right',
            show: true
          }
        },
        focusNodeAdjacency: true,
        roam: true,
        lineStyle: {
          width: 0.5,
          curveness: 0.3,
          opacity: 0.7
        }
      }
    ]
  }
  chart.setOption(option, true)
}

const subRegex = /^[A-Z]+/
function getSubject (courseName) {
  return courseName.match(subRegex)[0]
}

$('#panel-form').submit((e) => {
  e.preventDefault()
  const excludeStr = $('#to-exclude').val()
  const layoutStr = $('#layout').val()
  const series = option.series[0]

  // Update the layout
  series.layout = layoutStr

  const filterSet = new Set(excludeStr
    .split(',')
    .map(x => x.trim()))

  // Empty filter, use all nodes
  if (excludeStr.length === 0) {
    series.data = catalogData
    series.links = catalogLinks
    return chart.setOption(option, true)
  }

  // Valid filter, filter catalog nodes
  series.data = catalogData.filter(node => filterSet.has(getSubject(node.id)))
  series.links = catalogLinks.filter(link => {
    return filterSet.has(getSubject(link.source)) && filterSet.has(getSubject(link.target))
  })
  chart.setOption(option, true)
})

$.get({
  url: 'data/202110_all_graph.json',
  success: onData,
  dataType: 'json'
})
