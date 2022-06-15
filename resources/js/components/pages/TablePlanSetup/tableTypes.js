import {fabric} from "fabric";

const tableWidth = 30
const seatWidth = 4
const seatLength = 15
const tableStroke = '#c0c0c0'

// noinspection JSSuspiciousNameCombination
export const tableTypes = {
  'rect_1_1': {
    width: tableWidth,
    height: tableWidth,
    seats: [
      {
        width: seatWidth,
        height: seatLength,
        dx: -(tableWidth/2+seatWidth/2+3),
        dy: 0,
      }
    ]
  },
  'rect_1_2': {
    width: tableWidth,
    height: tableWidth,
    seats: [
      {
        width: seatLength,
        height: seatWidth,
        dx: 0,
        dy: -(tableWidth/2+seatWidth/2+3),
      },
      {
        width: seatLength,
        height: seatWidth,
        dx: 0,
        dy: (tableWidth/2+seatWidth/2+3),
      }
    ]
  },
  'rect_1_2_1': {
    width: tableWidth,
    height: tableWidth,
    seats: [
      {
        width: seatLength,
        height: seatWidth,
        dx: 0,
        dy: -(tableWidth/2+seatWidth/2+3),
      },
      {
        width: seatWidth,
        height: seatLength,
        dx: -(tableWidth/2+seatWidth/2+3),
        dy: 0,
      }
    ]
  },
  'rect_1_3': {
    width: tableWidth,
    height: tableWidth,
    seats: [
      {
        width: seatLength,
        height: seatWidth,
        dx: 0,
        dy: -(tableWidth/2+seatWidth/2+3),
      },
      {
        width: seatWidth,
        height: seatLength,
        dx: -(tableWidth/2+seatWidth/2+3),
        dy: 0,
      },
      {
        width: seatLength,
        height: seatWidth,
        dx: 0,
        dy: (tableWidth/2+seatWidth/2+3),
      }
    ]
  },
  // 'rect_2_4': {
  //   width: tableWidth * 2,
  //   height: tableWidth,
  // },
}

export const rectTable = (key,data) => {
  const type = tableTypes[data['type']]
  let seats = []
  type.seats.forEach(seat => {
    const s = new fabric.Rect({
      left: seat.dx,
      top: seat.dy,
      width: seat.width,
      height: seat.height,
      fill: tableStroke,
      strokeWidth: 0,
      originX: 'center',
      originY: 'center',
      selectable: false
    })
    seats.push(s)
  })
  const table = new fabric.Rect({
    width: type.width,
    height: type.height,
    fill: data['color'],
    stroke: tableStroke,
    strokeWidth: 3,
    originX: 'center',
    originY: 'center',
    centeredRotation: true,
    selectable: false,
    rx: 4,
    ry: 4
  })
  const tableG = new fabric.Group([table, ...seats], {
    centeredRotation: true,
    snapAngle: 45,
    originX: 'center',
    originY: 'center',
    angle: data['angle'],
  })

  const text = tableText(data)

  const og = new fabric.Group([tableG, text], {
    left: data['left'],
    top: data['top'],
    centeredRotation: true,
    lockRotation: true,
    lockScalingX: true,
    lockScalingY: true,
    snapAngle: 45,
    selectable: true,
    hasControls: false,
    originX: 'center',
    originY: 'center',
    id: key,
    data: data
  })

  return og
}

export const tableText = (data) => {
  let objectArray = []
  if(data.hasOwnProperty('number')){
    const textNumber = new fabric.IText('t: '+data['number'].toString(), {
      // fontFamily: 'Calibri',
      top: -8,
      fontSize: 10,
      fill: contrastColor(data['color']),
      textAlign: 'center',
      originX: 'center',
      originY: 'center'
    })
    objectArray.push(textNumber)
  }

  if(data.hasOwnProperty('seats')) {
    const textSeats = new fabric.IText('s: ' + data['seats'].toString(), {
      fontSize: 10,
      fill: contrastColor(data['color']),
      textAlign: 'center',
      originX: 'center',
      originY: 'center'
    })
    objectArray.push(textSeats)
  }

  if(data.hasOwnProperty('time') && data['time'].length > 0 &&
    data['time'][0].hasOwnProperty('group') && data['time'][0]['group']) {
    const textGroup = new fabric.IText('g: ' + data['time'][0]['group'].toString(), {
      top: 8,
      fontSize: 10,
      fill: contrastColor(data['color']),
      textAlign: 'center',
      originX: 'center',
      originY: 'center'
    })
    objectArray.push(textGroup)
  }

  const g = new fabric.Group(objectArray, {
    centeredRotation: true,
    snapAngle: 45,
    originX: 'center',
    originY: 'center',
  })

  return g
}

const contrastColor = (hex) => {
  var r = parseInt(hex.slice(1, 3), 16),
    g = parseInt(hex.slice(3, 5), 16),
    b = parseInt(hex.slice(5, 7), 16);

  return (r * 0.299 + g * 0.587 + b * 0.114) > 186
    ? '#000000'
    : '#FFFFFF';
}
