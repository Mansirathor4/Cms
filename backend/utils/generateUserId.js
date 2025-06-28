// const generateUserId = () => {
//     const prefix = 'USER';
//     const randomNum = Math.floor(100000 + Math.random() * 900000);
//     return `${prefix}${randomNum}`;
//   };
//   module.exports = generateUserId;

// backend/utils/generateUserId.js

const generateUserId = (role) => {
  let prefix = '';

  // Convert role to uppercase to handle potential case variations
  const upperCaseRole = role.toUpperCase();

  switch (upperCaseRole) {
    case 'USER':
      prefix = 'USR';
      break;
    case 'DIVISIONHEAD':
      prefix = 'DVH';
      break;
    case 'COORDINATOR':
      prefix = 'CMC';
      break;
    case 'ASSIGNEE':
      prefix = 'ASG';
      break;
    default:
      prefix = 'USER';
      break;
  }

  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}${randomNum}`;
};

module.exports = generateUserId;