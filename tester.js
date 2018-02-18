function hello() {
  let i = 0;

  for (var j = 0; j < 4; j++) {
    console.log('helloj', j)
    while(i < 5) {
      console.log(`hello ${i}`)
      i++;
    }
  }
}

function another() {
  console.log('anodata')
}

function fak() {
  hello();
  another();
}

fak();
