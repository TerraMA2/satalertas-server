module.exports.setBoundingBox = (bBox) => {
    const bboxArray = bBox.split(',');
    const bbox1 = bboxArray[0].split(' ');
    const bbox2 = bboxArray[1].split(' ');

    let Xmax = parseFloat(bbox2[0]);
    let Xmin = parseFloat(bbox1[0]);

    let Ymax = parseFloat(bbox2[1]);
    let Ymin = parseFloat(bbox1[1]);

    let difX = Math.abs(Math.abs(Xmax) - Math.abs(Xmin));
    let difY = Math.abs(Math.abs(Ymax) - Math.abs(Ymin));

    if (difX > difY) {
        const fac = difX - difY;
        Ymin -= fac / 2;
        Ymax += fac / 2;
    } else if (difX < difY) {
        const fac = difY - difX;
        Xmin -= fac / 2;
        Xmax += fac / 2;
    }

    return `${ Xmin },${ Ymin },${ Xmax },${ Ymax }`;
};
