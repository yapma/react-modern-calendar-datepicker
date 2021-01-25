import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import '../../src/DatePicker.css';
import { Calendar } from '../../src';
import * as serviceWorker from './serviceWorker';
import moment from 'moment-jalaali';

// const App = () => {
//   const [selectedDay, setValue] = useState(null);
//   return <DatePicker value={selectedDay} onChange={setValue} shouldHighlightWeekends />;
// };

class App extends React.Component {
  state = { selectedDay: '', costsList: null, lastCalendarDate: new Date() };
  constructor(props) {
    super(props);
    this.setSelectedDay = this.setSelectedDay.bind(this);
  }

  toDate(value) {
    if (!value) {
      return null;
    }
    const jalaliDate = moment(value, 'jYYYY/jM/jDTHH:mm:ss');
    let date;

    if (Number(jalaliDate.format('jMM')) == 1) {
      if (Number(jalaliDate.format('jDD')) == 1) {
        date = new Date(
          moment(value, 'jYYYY/jM/jDTHH:mm:ss')
            .add(3, 'hour')
            .add(30, 'minute')
            .format('YYYY-MM-DDTHH:mm:ss'),
        );
      } else {
        date = new Date(
          moment(value, 'jYYYY/jM/jDTHH:mm:ss')
            .add(4, 'hour')
            .add(30, 'minute')
            .format('YYYY-MM-DDTHH:mm:ss'),
        );
      }
    } else if (Number(jalaliDate.format('jMM')) > 1 && Number(jalaliDate.format('jMM')) < 6) {
      date = new Date(
        moment(value, 'jYYYY/jM/jDTHH:mm:ss')
          .add(4, 'hour')
          .add(30, 'minute')
          .format('YYYY-MM-DDTHH:mm:ss'),
      );
    } else if (Number(jalaliDate.format('jMM')) === 6) {
      if (Number(jalaliDate.format('jDD')) <= 30) {
        date = new Date(
          moment(value, 'jYYYY/jM/jDTHH:mm:ss')
            .add(4, 'hour')
            .add(30, 'minute')
            .format('YYYY-MM-DDTHH:mm:ss'),
        );
      } else {
        date = new Date(
          moment(value, 'jYYYY/jM/jDTHH:mm:ss')
            .add(3, 'hour')
            .add(30, 'minute')
            .format('YYYY-MM-DDTHH:mm:ss'),
        );
      }
    } else if (Number(jalaliDate.format('jMM')) > 6) {
      date = new Date(
        moment(value, 'jYYYY/jM/jDTHH:mm:ss')
          .add(3, 'hour')
          .add(30, 'minute')
          .format('YYYY-MM-DDTHH:mm:ss'),
      );
    }
    return date;
  }

  getMonthStartDateByShamsiInput(date) {
    date.subtract(Number(date.format('jDD')) - 1, 'day');
    return toDate(date.format('jYYYY/jMM/jDD'));
  }

  getMonthEndDateByShamsiInput(date) {
    let result = new Date();
    let value = new Date(date.toDate());

    // const date = momentJalaali(value);

    const shamsiMonthNumber = Number(date.format('jMM'));

    for (let counter = 1; counter <= 31; counter++) {
      if (counter != 1) {
        value.setDate(value.getDate() + 1);
      }
      const currentLoopShamsiDate = moment(value);
      const currentLoopShamsiMonth = Number(currentLoopShamsiDate.format('jMM'));

      if (shamsiMonthNumber != currentLoopShamsiMonth) {
        break;
      }

      result = currentLoopShamsiDate.toDate();
    }

    return result;
  }

  // ---------------------------------------
  setSelectedDay = day => {
    console.log('>>>', day);
    this.setState({ selectedDay: day });
  };

  onRenderDayCell = (day) => {
    console.log('onRenderDayCell');

    if (this.state.costsList) {
      let dayCost = this.state.costsList.find(x => {
        let dateParts = x?.date.split('/');
        let xYear = +dateParts[0];
        let xMonth = +dateParts[1];
        let xDay = +dateParts[2];
        return day.year == xYear && day.month == xMonth && day.day == xDay;
      });

      if (dayCost) {
        return {
          basePrice: dayCost.basePrice.toString(),
        };
      }
      return '';
    }
  };

  onChangeDate = date => {
    console.log('onChangeDate');

    let endDate = this.getMonthEndDateByShamsiInput(
      moment(
        date.year.toString() + '/' + date.month.toString() + '/' + date.day.toString(),
        'jYYYY/jM/jD',
      ),
    );

    let startDateShamsi = date.year.toString() + '/' + date.month.toString() + '/01';
    let endDateShamsi = moment(endDate).format('jYYYY/jMM/jDD');

    if (
      !this.state.lastCalendarDate ||
      (this.state.lastCalendarDate &&
        (date.year != this.state.lastCalendarDate.year ||
          date.month != this.state.lastCalendarDate.month ||
          date.day != this.state.lastCalendarDate.day))
    ) {
      this.setState({ lastCalendarDate: date });
      fetch(
        'http://localhost:4106/api/Notification/ShowingPrice?TourismServiceID=19635&start=' +
          startDateShamsi +
          '&end=' +
          endDateShamsi,
      )
        .then(res => res.json())
        .then(data => {
          this.setState({ costsList: data.data }, () => {
            // console.log('d = ', this.state.costsList);
          });
        })
        .catch(console.log);
    }
  };
  //----------------------------------------

  render() {
    return (
      <Calendar
        value={this.state.selectedDay}
        onChange={this.setSelectedDay}
        shouldHighlightWeekends
        locale="fa"
        // onRenderDayCell={this.onRenderDayCell}
        // onChangeDate={this.onChangeDate}
      />
    );
  }
}


ReactDOM.render(<App />, document.getElementById('root'));
serviceWorker.unregister();
