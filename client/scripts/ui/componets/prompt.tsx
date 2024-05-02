

export const prompt = (title, callback) => {
  return callback(window.prompt(title));
}