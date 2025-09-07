export const iconTypeMap = {
  'Sleep Score': 'https://assets.bonatra.com/package_detail/Sleep%20Score.svg',
  Dropdown: 'https://assets.bonatra.com/package_detail/Dropdown.svg',
  'Readiness Score':
    'https://assets.bonatra.com/package_detail/Readiness%20Score.svg',
  'Metabolic Score':
    'https://assets.bonatra.com/package_detail/Metabolic%20Score.svg',
  'Movement Index':
    'https://assets.bonatra.com/package_detail/Movement%20Index.svg',
  'Heart Rate':
    'https://assets.bonatra.com/package_detail/Latest%20Heart%20Rate.svg',
  Temperature: 'https://assets.bonatra.com/temperature%201.svg',
  Steps: 'https://assets.bonatra.com/package_detail/Steps.svg',
  Locked: 'https://assets.bonatra.com/package_detail/lock%201.svg',
  'Greater Good':
    'https://assets.bonatra.com/package_detail/arrow-up-right%20(2)%201.svg',
  'Smaller Bad':
    'https://assets.bonatra.com/package_detail/arrow-up-right%20(2)%202.svg',
  'Greater Bad':
    'https://assets.bonatra.com/package_detail/arrow-up-right%20(2)%203.svg',
  'Smaller Good':
    'https://assets.bonatra.com/package_detail/arrow-up-right%20(2)%204.svg',
  'Greater Neutral':
    'https://assets.bonatra.com/package_detail/arrow-up-right%20(2)%205.svg',
  'Smaller Neutral':
    'https://assets.bonatra.com/package_detail/arrow-up-right%20(2)%206.svg',
  Navigate:
    'https://assets.bonatra.com/package_detail/angle-circle-right%20(1)%201.svg',
  'Ring Sync':
    'https://bonatra-assets.s3.ap-south-1.amazonaws.com/synchronize%202.svg',
  'CGM Sync':
    'https://bonatra-assets.s3.ap-south-1.amazonaws.com/synchronize%201.svg',
  'Glucose Variability': 'https://assets.bonatra.com/component%201.svg',
  'Latest Glucose': 'https://assets.bonatra.com/glucose%201.svg',
  'Time in Target Range %': 'https://assets.bonatra.com/in-time%20(1)%201.svg',
  'VO2 Max': 'https://assets.bonatra.com/package_detail/Vo2%20max.svg',
};

export const getIconForType = type => {
  return iconTypeMap[type];
};
