import dayjs from "dayjs"

const formatDate = (date, format = 'DD/MMM/YYYY') => {
  return dayjs(date).format(format);
};

export default formatDate
