const moment = require('moment-timezone');
const { exec, spawn } = require('child_process');
const fs = require('fs');
const JSZip = require('jszip');
const schedule = require('node-schedule');
const os = require('os');
let mysqlUser = 'root';
let mysqlPassword = 'ekdnsel';
let hostName = '127.0.0.1';
let folderName = 'local';
// 회사 정보 이므로 제거.
let farmList = [
  {
    Name: '목장 이름',
    url: 'db주소',
  }
];

//기존코드 파일,zip 다 생성

let dt = moment().format('YYYYMMDD_HHmmss');
let fname = `DataBase/${folderName}-${dt}.sql`;

let zname = `DataBase/${folderName}-${dt}.zip`;

console.log('os.flatform()', os.platform());
const run = async () => {
  if (!fs.existsSync('DataBase')) {
    fs.mkdirSync('DataBase');
  }
  return new Promise(async (resolve, reject) => {
    let wStream = fs.createWriteStream(fname);
    console.log('DB file 생성중...');
    let mySqlDump;
    os.platform() === 'win32'
      ? (mySqlDump = spawn('c:/xampp/mysql/bin/mysqldump', [
          `-u${mysqlUser}`,
          `-p${mysqlPassword}`,
          `-h${hostName}`,
          '--routines',
          '--events',
          '--triggers',
          '--add-drop-table',
          '--databases',
          'dawoon',
        ]))
      : (mySqlDump = spawn('/usr/bin/mysqldump', [
          `-u${mysqlUser}`,
          `-p${mysqlPassword}`,
          `-h${hostName}`,
          '--routines',
          '--events',
          '--triggers',
          '--add-drop-table',
          '--databases',
          'dawoon',
        ]));

    mySqlDump.stdout
      .pipe(wStream)
      .on('finish', function () {
        console.log(`${folderName}DB백업 완료`);
        wStream.end();
        resolve();
      })
      .on('error', function (err) {
        console.log(`${folderName}DB백업 실패`, err);
        reject();
      });
  });
};
// 즉시실행 할때 사용
(async () => {
  for (const item of farmList) {
    hostName = item.url;
    folderName = item.Name;
    fname = `DataBase/${folderName}-${dt}.sql`.trim();
    // zname = `DataBase/${folderName}-${dt}.zip`.trim();
    await run();
  }
  console.log('모든 백업이 종료되었습니다.');
})();

//오전 12시 오후 12시 하루 두번 백업 스케쥴링
schedule.scheduleJob('0 0,12 * * *', async () => {
  for (const item of farmList) {
    dt = moment().format('YYYYMMDD_HHmmss');
    hostName = item.url;
    folderName = item.Name;
    fname = `DataBase/${folderName}-${dt}.sql`.trim();
    // zname = `DataBase/${folderName}-${dt}.zip`.trim();
    await run();
  }
});
//zip,file 둘다생성
// const dt = moment().format('YYYYMMDD_HHmmss');
// let fname = `DataBase/${folderName}-${dt}.sql`;

// let zname = `DataBase/${folderName}-${dt}.zip`;

// const run = async () => {
//   if (!fs.existsSync('DataBase')) {
//     fs.mkdirSync('DataBase');
//   }
//   return new Promise(async (resolve, reject) => {
//     let wStream = fs.createWriteStream(fname);
//     console.log('DB file 생성중...');
//     let mySqlDump = spawn('c:/xampp/mysql/bin/mysqldump', [
//       `-u${mysqlUser}`,
//       `-p${mysqlPassword}`,
//       `-h${hostName}`,
//       '--routines',
//       '--events',
//       '--triggers',
//       '--add-drop-table',
//       '--databases',
//       'dawoon',
//     ]);

//     mySqlDump.stdout
//       .pipe(wStream)
//       .on('finish', async function () {
//         console.log('생성된 파일 압축중...');
//         const jsZip = new JSZip();
//         jsZip.file(fname, fs.readFileSync(fname));
//         try {
//           let content = await jsZip.generateAsync({
//             type: 'nodebuffer',
//             compression: 'DEFLATE',
//           });
//           fs.writeFileSync(zname, content, 'binary');
//           console.log('완료!');
//           wStream.end();
//           resolve();
//         } catch (err) {
//           console.error('압축중 에러 발생:', err);
//           reject(err);
//         }
//       })
//       .on('error', function (err) {
//         console.log(err);
//         reject(err);
//       });
//   });
// };

//zip만 생성

// const dt = moment().format('YYYYMMDD_HHmmss');
// let zname = `${mysqlUser}/dawoon-${dt}.zip`;

// const run = () => {
//   // Create a folder with the MySQL user's name if it doesn't exist
//   if (!fs.existsSync(mysqlUser)) {
//     fs.mkdirSync(mysqlUser);
//   }

//   console.log('Creating dawoon DB file in memory...');

//   let mySqlDump = spawn('c:/xampp/mysql/bin/mysqldump', [
//     `-u${mysqlUser}`,
//     `-p${mysqlPassword}`,
//     '--routines',
//     '--events',
//     '--triggers',
//     '--add-drop-table',
//     '--databases',
//     'dawoon',
//   ]);

//   // Collect the data from mySqlDump.stdout
//   let sqlData = [];
//   mySqlDump.stdout.on('data', (chunk) => {
//     sqlData.push(chunk);
//   });

//   mySqlDump.stdout
//     .on('end', function () {
//       console.log('Compressing the SQL data...');
//       let zip = new JSZip();
//       zip.file(`dawoon-${dt}.sql`, Buffer.concat(sqlData));
//       zip
//         .generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' })
//         .then((content) => {
//           fs.writeFileSync(zname, content, 'binary');
//           console.log('Completed!');
//         });
//     })
//     .on('error', function (err) {
//       console.log(err);
//     });
// };
