const tableWidth = 30
const seatWidth = 4
const seatLength = 15

// noinspection JSSuspiciousNameCombination
export default {
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
  'rect_2_4': {
    width: tableWidth * 2,
    height: tableWidth,
  },
}
