# rxloop-loading

> rxloop loading plugin

## Usage

```javascript
import rxloop from '@rxloop/core';
import loading from '@rxloop/loading';

const app = rxloop({
  plugins: [ loading() ],
});

app.model({
  name: 'modelA',
  state: {
    a: 1,
  },
  reducers: {
    add(state) {
      return state;
    },
  },
  epics: {
    getData(action$) {
      return action$.pipe(
        mapTo({
          type: 'add',
        }),
      );
    },
    setData(action$) {
      return action$.pipe(
        mapTo({
          type: 'add',
        }),
      );
    },
  },
});

app.stream('modelA').subscribe((state) => {
  console.log(state.loading.getData);
});

app.stream('loading').subscribe((state) => {
  console.log(state);
    // {
    //   epics: {
    //     modelA: {
    //       getData: false,
    //       getDataCounter: 0,
    //       setData: false,
    //       setDataCounter: 0,
    //     },
    //   },
    // }
});
```

