const sortingByAge = require('./App');


test('testing firstName is Mahesh',()=>{
    const sorted = sortingByAge();
    expect(sorted[0].name).toBe("Mahesh")
})

test('testing lastName is Dinesh',()=>{
    const sorted = sortingByAge();
    expect(sorted[sorted.length-1].name).toBe("Dinesh")
})
// test('no data need',()=>{
//     const sorted = sortingByAge();
//     expect(sorted).toBeUndefined(undefined);
// })