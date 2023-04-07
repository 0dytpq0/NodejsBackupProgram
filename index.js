const moment = require('moment');
const { exec, spawn } = require('child_process');
const fs = require('fs');
const JSZip = require('jszip');
const schedule = require('node-schedule');
let mysqlUser = 'root';
let mysqlPassword = 'ekdnsel';
let hostName = '127.0.0.1';
let folderName = 'local';
let farmList = [
  {
    Name: '양주-쇠골목장',
    url: '4039-op.dawoon',
  },
  {
    Name: '함안-부흥목장',
    url: '4046-op.dawoon',
  },
  {
    Name: '보성-수종목장',
    url: '4055-sv.dawoon',
  },
  {
    Name: '파주-증환목장',
    url: '4060-op.dawoon',
  },
  {
    Name: '성환-축산과학원',
    url: '3873-op.dawoon',
  },
  {
    Name: '당진-병정목장',
    url: '4062-op.dawoon',
  },
  {
    Name: '강진-농업기술원',
    url: '3943-op.dawoon',
  },
  {
    Name: '예산-가람목장',
    url: '4066-op.dawoon',
  },
  {
    Name: '이천-차원목장',
    url: '4064-op.dawoon',
  },
  {
    Name: '서산-태광목장',
    url: '4045-op.dawoon',
  },
  {
    Name: '강화-브니엘',
    url: '4067-op.dawoon',
  },
  {
    Name: '경주-이레목장',
    url: '3406-sv.dawoon',
  },
  {
    Name: '양평-믿음목장',
    url: '3412-op.dawoon',
  },
];

//기존코드 파일,zip 다 생성

const dt = moment().format('YYYYMMDD_HHmmss');
let fname = `DataBase/${folderName}-${dt}.sql`;

let zname = `DataBase/${folderName}-${dt}.zip`;

const run = async () => {
  if (!fs.existsSync('DataBase')) {
    fs.mkdirSync('DataBase');
  }
  return new Promise(async (resolve, reject) => {
    let wStream = fs.createWriteStream(fname);
    console.log('DB file 생성중...');
    let mySqlDump = spawn('c:/xampp/mysql/bin/mysqldump', [
      `-u${mysqlUser}`,
      `-p${mysqlPassword}`,
      `-h${hostName}`,
      '--routines',
      '--events',
      '--triggers',
      '--add-drop-table',
      '--databases',
      'dawoon',
    ]);

    mySqlDump.stdout
      .pipe(wStream)
      .on('finish', async function () {
        console.log('생성된 파일 압축중...');
        const jsZip = new JSZip();
        jsZip.file(fname, fs.readFileSync(fname));
        try {
          let content = await jsZip.generateAsync({
            type: 'nodebuffer',
            compression: 'DEFLATE',
          });
          fs.writeFileSync(zname, content, 'binary');
          console.log('완료!');
          wStream.end();
          resolve();
        } catch (err) {
          console.error('압축중 에러 발생:', err);
          reject(err);
        }
      })
      .on('error', function (err) {
        console.log(err);
        reject(err);
      });
  });
};
// //즉시실행 할때 사용
// (async () => {
//   for (const item of farmList) {
//     hostName = item.url;
//     folderName = item.Name;
//     fname = `DataBase/${folderName}-${dt}.sql`;
//     zname = `DataBase/${folderName}-${dt}.zip`;
//     await run();
//   }
//   console.log('모든 백업이 종료되었습니다.');
// })();

//오전 12시 오후 12시 하루 두번 백업 스케쥴링
schedule.scheduleJob('0 0,12 * * *', async () => {
  for (const item of farmList) {
    hostName = item.url;
    folderName = item.Name;
    fname = `DataBase/${folderName}-${dt}.sql`;
    zname = `DataBase/${folderName}-${dt}.zip`;
    await run();
  }
});

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
