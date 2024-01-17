export const channelOptions = [
  {
    value: 'relay_channel',
    label: '继电器通道',
    children: [
      {value: '00000001', label: '1'}, {value: '00000002', label: '2'},
      {value: '00000003', label: '3'}, {value: '00000004', label: '4'},
      {value: '00000005', label: '5'}, {value: '00000006', label: '6'},
      {value: '00000007', label: '7'}, {value: '00000008', label: '8'},
      {value: '00000009', label: '9'}, {value: '0000000A', label: '10'},
      {value: '0000000B', label: '11'}, {value: '0000000C', label: '12'},
      {value: '0000000D', label: '13'}, {value: '0000000E', label: '14'},
      {value: '0000000F', label: '15'}, {value: '00000010', label: '16'}
    ]
  },
  {
    value: 'voltage_channel_1',
    label: '可采 0-6.5V 电压通道',
    children: [
      {value: '00000011', label: '1'}, {value: '00000012', label: '2'},
      {value: '00000013', label: '3'}, {value: '00000014', label: '4'}
    ]
  },
  {
    value: 'voltage_channel_2',
    label: '可采 6.5-50V 电压通道',
    children: [
      {value: '00000015', label: '1'}, {value: '00000016', label: '2'},
      {value: '00000017', label: '3'}, {value: '00000018', label: '4'},
      {value: '00000019', label: '5'}, {value: '0000001A', label: '6'},
      {value: '0000001B', label: '7'}, {value: '0000001C', label: '8'}
    ]
  },
  {
    value: 'voltage_channel_3',
    label: '可采 50-100V 电压通道',
    children: [
      {value: '0000001D', label: '1'}, {value: '0000001E', label: '2'},
      {value: '0000001F', label: '3'}, {value: '00000020', label: '4'},
      {value: '00000021', label: '5'}, {value: '00000022', label: '6'},
      {value: '00000023', label: '7'}, {value: '00000024', label: '8'}
    ]
  },
  {
    value: 'voltage_channel_4',
    label: '可采 100-150V 电压通道',
    children: [
      {value: '00000025', label: '1'}, {value: '00000026', label: '2'}
    ]
  },
  {
    value: 'voltage_channel_5',
    label: '可采 150-1000V 电压通道',
    children: [
      {value: '00000027', label: '1'}, {value: '00000028', label: '2'}
    ]
  },
  {
    value: 'voltage_channel_6',
    label: '可采 AC220V 电压通道',
    children: [
      {value: '00000029', label: '1'}, {value: '0000002A', label: '2'}
    ]
  },
  {
    value: 'voltage_channel_7',
    label: '可采 AC380V 电压通道',
    children: [
      {value: '0000002B', label: '1'}, {value: '0000002C', label: '2'}
    ]
  },
  {
    value: '0000002D',
    label: '可采 0-5A 电流通道'
  },
  {
    value: '0000002E',
    label: '可采 0-20A 电流通道'
  },
  {
    value: '0000002F',
    label: '可采 0-30A 电流通道'
  },
  {
    value: '00000030',
    label: '可采 0-100A 电流通道'
  }
]

export const channelArray = generateModifiedArray(channelOptions)

function generateModifiedArray(options, prefix = '') {
  const resultArray = []

  options.forEach(option => {
    if (option.children) {
      resultArray.push(...generateModifiedArray(option.children, `${prefix}${option.label}-`))
    } else {
      resultArray.push({
        value: option.value,
        label: `${prefix}${option.label}`
      })
    }
  })

  return resultArray
}
