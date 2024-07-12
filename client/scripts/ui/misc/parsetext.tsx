import React from 'react';

function parsePart(part, state) {
  if (part.trim().startsWith('- ')) {
    if (!state.inul) {
      state.inul = true;
      state.ulContent = [<li key={state.key++}>{part.slice(2)}</li>];
    } else {
      state.ulContent.push(<li key={state.key++}>{part.slice(2)}</li>);
    }
    return null;
  } else {
    if (state.inul) {
      state.inul = false;
      const ul = <ul key={state.key++}>{state.ulContent}</ul>;
      state.ulContent = [];
      return [ul, <span key={state.key++}>{part}</span>];
    }
    return <span key={state.key++}>{part}</span>;
  }
}

export function parseItemDataText(string) {
  let state = {
    inul: true,
    ulContent: [],
    key: 0,
  };

  const parts = string.trim().split('\n').map((part) => {
    return parsePart(part, state);
  });

  if (state.inul) {
    parts.push(<ul key={state.key++}>{state.ulContent}</ul>);
  }

  return <span>{parts.flat()}</span>;
}
