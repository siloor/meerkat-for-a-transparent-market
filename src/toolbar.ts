import { diffHTML } from './Diffr';
import { BASE_PROPERTIES } from './constants';
import { setToolbar } from './dic';

const timestampToString = (timestamp) => {
  const date = new Date(timestamp);

  return (new Date(date.getTime() - (date.getTimezoneOffset() * 60 * 1000))).toISOString().split('T')[0].replace(/-/g, '.') + '.';
};

const numberToString = (number) => {
  if (number === null) {
    return '-';
  }

  const parts = number.toString().split('.');

  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

  return parts.join('.');
};

const getTextDiff = (oldValue, value) => {
  return diffHTML(oldValue, value)
    .replace(/<ins/g, '<ins style="text-decoration: none; color: #39b54a;"')
    .replace(/<del/g, '<del style="color: #ff4500;"');
};

const propertyToStyleRuleName = (name) => {
  return name.replace(/[A-Z]/g, match => `-${match.toLowerCase()}`);
};

const generateStyles = (styles) => {
  const result = { ...styles };

  for (const key of Object.keys(result)) {
    result[key] = Object.keys(result[key])
      .map(prop => `${propertyToStyleRuleName(prop)}: ${result[key][prop]};`)
      .join(' ');
  }

  return result;
};

const renderElement = ({
  creationDate,
  days,
  priceDifference,
  currency,
  commentCount,
  changes
}) => {
  const changesHTML = [];

  const commonStyles = {
    tableHeader: {
      padding: '8px',
      position: 'sticky',
      top: '0',
      background: '#eee',
      boxShadow: 'inset 0 -1px 0 #bbb',
      fontSize: '14px',
      color: '#999'
    },
    logo: {
      display: 'inline-block',
      width: '20px',
      height: '20px',
      lineHeight: '20px',
      borderRadius: '10px',
      textAlign: 'center',
      fontSize: '14px',
      fontWeight: 'bold',
      backgroundColor: '#ccc',
      color: '#fff'
    }
  };

  const styles = generateStyles({
    container: {
      position: 'relative',
      float: 'left',
      background: '#eee',
      borderRadius: '16px',
      padding: '8px',
      boxShadow: '0 1px 2px rgba(0,0,0,0.16), 0 1px 2px rgba(0,0,0,0.23)',
      fontFamily: '\'Open Sans\', \'Helvetica Neue\', Helvetica, Arial, sans-serif',
      fontSize: '12px'
    },
    logo: {
      ...commonStyles.logo
    },
    date: {
      marginLeft: '20px',
      color: '#999'
    },
    priceDifference: {
      marginLeft: '20px',
      fontWeight: priceDifference === 0 || priceDifference === null ? 'normal' : 'bold',
      color: priceDifference === 0 || priceDifference === null ? '#999' : (priceDifference > 0 ? '#ff4500' : '#39b54a')
    },
    changesButton: {
      marginLeft: '20px',
      color: changes.length > 0 ? '#333' : '#999'
    },
    changes: {
      position: 'absolute',
      bottom: '0',
      left: '0',
      background: '#eee',
      width: '0px',
      height: '0px',
      opacity: '0',
      borderRadius: '16px',
      overflow: 'hidden',
      transition: 'width 0.2s, height 0.2s, opacity 0.2s',
      boxShadow: '0 1px 2px rgba(0, 0, 0, 0.16), 0 1px 2px rgba(0, 0, 0, 0.23)',
      display: 'flex',
      flexDirection: 'column'
    },
    tableContainer: {
      padding: '10px 10px 0 10px',
      overflow: 'auto',
      flexGrow: '1'
    },
    tableContainerInner: {
      width: '100%',
      height: '100%',
      overflow: 'auto'
    },
    table: {
      tableLayout: 'fixed',
      width: '100%'
    },
    tableHeaderType: {
      ...commonStyles.tableHeader,
      width: '70px'
    },
    tableHeaderDate: {
      ...commonStyles.tableHeader,
      width: '90px'
    },
    tableHeaderValue: {
      ...commonStyles.tableHeader,
    },
    tableCell: {
      padding: '8px',
      overflow: 'hidden',
      textOverflow: 'ellipsis'
    },
    changesCloseButton: {
      ...commonStyles.logo,
      margin: '8px'
    },
    commentsButton: {
      marginLeft: '20px',
      marginRight: '10px',
      color: commentCount > 0 ? '#333' : '#999'
    }
  });

  for (const change of changes) {
    changesHTML.push(`
      <tr>
        <td style="${styles.tableCell}">${change.type}</td>
        <td style="${styles.tableCell}">${timestampToString(change.date)}</td>
        <td style="${styles.tableCell}">${getTextDiff(change.oldValue, change.value)}</td>
      </tr>
    `);
  }

  const translations = {
    firstSaw: 'Első megtekintés',
    daysAgo: 'napja',
    priceChange: 'Árváltozás',
    changes: 'Változások',
    changesLabelType: 'Típus',
    changesLabelDate: 'Dátum',
    changesLabelValue: 'Érték',
    comments: 'Hozzászólások'
  };

  return `
<div>
  <div style="${styles.container}">
    <span style="${styles.logo}">M</span>
    <span style="${styles.date}" title="${translations.firstSaw}: ${timestampToString(creationDate)}">${days} ${translations.daysAgo}</span>
    <span style="${styles.priceDifference}" title="${translations.priceChange}">${priceDifference > 0 ? '+' : ''}${numberToString(priceDifference)}${currency === null ? '' : ` ${currency}`}</span>
    <a style="${styles.changesButton}" href="javascript:void(0);">${translations.changes} (${changes.length})</a>
    <div style="${styles.changes}">
      <div style="${styles.tableContainer}">
        <div style="${styles.tableContainerInner}">
          <table style="${styles.table}">
            <thead>
              <th style="${styles.tableHeaderType}">${translations.changesLabelType}</th>
              <th style="${styles.tableHeaderDate}">${translations.changesLabelDate}</th>
              <th style="${styles.tableHeaderValue}">${translations.changesLabelValue}</th>
            </thead>
            <tbody>
              ${changesHTML.map(html => html.trim()).join('')}
            </tbody>
          </table>
        </div>
      </div>
      <div>
        <a href="javascript:void(0);" style="${styles.changesCloseButton}">X</a>
      </div>
    </div>
    <a style="${styles.commentsButton}" href="javascript:void(0);">${translations.comments} (${commentCount})</a>
  </div>
</div>
`;
};

const getElementParameters = (history, commentCount, propertiesToCheck, propertiesToCheckTranslations, stringToPrice) => {
  const oldPrice = stringToPrice(history[0].price);
  const newPrice = stringToPrice(history[history.length - 1].price);

  const changes = [];

  for (let i = 1; i < history.length; i++) {
    for (const property of propertiesToCheck) {
      const value = history[i][property];
      const oldValue = history[i - 1][property];

      if (value === oldValue) {
        continue;
      }

      changes.push({
        type: propertiesToCheckTranslations[property],
        date: history[i][BASE_PROPERTIES.CREATED_TIMESTAMP],
        value: value,
        oldValue: oldValue
      });
    }
  }

  return {
    creationDate: history[0][BASE_PROPERTIES.CREATED_TIMESTAMP],
    days: Math.round(((new Date()).getTime() - history[0][BASE_PROPERTIES.CREATED_TIMESTAMP]) / (1000 * 60 * 60 * 24)),
    priceDifference: oldPrice.value === null && newPrice.value === null ? null : newPrice.value - oldPrice.value,
    currency: oldPrice.currency === null ? newPrice.currency : oldPrice.currency,
    commentCount: commentCount,
    changes
  };
};

const initToolbar = (root, item, propertiesToCheck, propertiesToCheckTranslations, stringToPrice, openComments) => {
  const parameters = getElementParameters(item.history, item.commentCount, propertiesToCheck, propertiesToCheckTranslations, stringToPrice);

  root.innerHTML = renderElement(parameters).trim();

  const element = root.firstElementChild;
  const openButton = element.getElementsByTagName('a')[0];
  const closeButton = element.getElementsByTagName('a')[1];
  const commentsButton = element.getElementsByTagName('a')[2];
  const historyElement = openButton.nextElementSibling as HTMLElement;

  let isClosed = true;

  const documentClickHandler = (e) => {
    if (element.contains(e.target)) {
      return;
    }

    toggleElement();
  };

  const toggleElement = () => {
    if (parameters.changes.length === 0) {
      return;
    }

    isClosed = !isClosed;

    historyElement.style.height = isClosed ? '0px' : '200px';
    historyElement.style.width = isClosed ? '0px' : '500px';
    historyElement.style.opacity = isClosed ? '0' : '1';

    if (isClosed) {
      document.removeEventListener('mousedown', documentClickHandler);
    } else {
      document.addEventListener('mousedown', documentClickHandler);
    }
  };

  openButton.addEventListener('click', toggleElement);
  closeButton.addEventListener('click', toggleElement);

  commentsButton.addEventListener('click', () => {
    openComments(item);
  });
};

setToolbar({
  initToolbar
});
