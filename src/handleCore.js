import fnsFormat from "date-fns/format";

const filterOutEmpty = data => !!data.disney_ref;

const reduceToNotYetApprovedMap = (merged, data) => {
  const isApproved = data.feedback !== "R";
  if (isApproved) {
    delete merged[data.disney_ref];
    return merged;
  }
  merged[data.disney_ref] = data;
  return merged;
};

const sortByDate = (dataA, dataB) => {
  if (dataA.date > dataB.date) {
    return 1;
  }
  if (dataA.date < dataB.date) {
    return -1;
  }
  return 0;
};

const convertDateFormat = data => {
  data.date = fnsFormat(data.date, "dd MMM, yyyy");
  return data;
};

function handleCore(list) {
  const notYetApprovedDataMap = list
    .filter(filterOutEmpty)
    .reduce(reduceToNotYetApprovedMap, {});

  const notYetApprovedSortedList = Object.values(notYetApprovedDataMap)
    .sort(sortByDate)
    .map(convertDateFormat);

  return notYetApprovedSortedList;
}

export default handleCore;
