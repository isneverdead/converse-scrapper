import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import * as cheerio from 'cheerio';

dotenv.config();

const app: Express = express();
const port = process.env.PORT;

app.get('/', async (req: Request, res: Response) => {

  try {
    console.log("/api/scrap : fetching converse website")
    const response = await fetch(`https://www.converse.com/shop/womens-shoes?srule=Featured&start=35&sz=60`, { cache: "no-cache" })
    const html = await response.text()
    console.log("/api/scrap : cherio load")
    const $ = cheerio.load(html);

    const shoeTitle: any = [];
    console.log("/api/scrap : data processing");
    // iterating every card products
    [...$('.plp-grid__item')].map((element: any) => {

      // get into product container
      // [...$(element).find(".product-tile")].map(async (item: any) => {
      //     const title = $(item).find(".product-tile__url").text().replace(/\n/g, '')
      //     const price = $(item).find(".product-price--sales").text().replace(/\n/g, '')
      //     const type = $(item).find(".product-tile__secondary-badge").text().replace(/\n/g, '');
      //     const productLink = $(item).find(".product-tile__img-url").attr("href");

      //     let imageList: any = [];
      //     [...$(item).find(".product-tile__img-container")].map((picture: any) => {
      //         const image = $(picture).find('img').attr("data-src")


      //         if (!image?.includes("medium_noimage")) {

      //             imageList.push(image)
      //         }

      //     })
      //     shoeTitle.push({ title, price, type, imageList, productLink })
      //     // shoeTitle.push({ title })
      // });
      const productTile = $(element).find(".product-tile");
      const title = $(productTile).find(".product-tile__url").text().replace(/\n/g, '')
      const price = $(productTile).find(".product-price--sales").text().replace(/\n/g, '')
      const type = $(productTile).find(".product-tile__secondary-badge").text().replace(/\n/g, '');
      const productLink = $(productTile).find(".product-tile__img-url").attr("href");

      let imageList: any = [];
      [...$(productTile).find(".product-tile__img-container")].map((picture: any) => {
        const image = $(picture).find('img').attr("data-src")


        if (!image?.includes("medium_noimage") && !imageList.includes(image)) {

          imageList.push(image)
        }

      })
      shoeTitle.push({ title, price, type, imageList, productLink })
      // [...$(element).find(".product-tile")].map(async (item: any) => {

      //     // shoeTitle.push({ title })
      // })
      // return temp
    })
    console.log("/api/scrap : data collected");
    console.log("/api/scrap : data length = " + shoeTitle.length);

    console.log("/api/scrap : data cleaning");
    // console.log($('.plp-grid__item').text());
    function cleaning(array: any[], uniqueKeyProp: string) {
      const allKeyProps = array.map((item: any) => {
        return item[uniqueKeyProp]
      })
      // console.log(allKeyProps)
      let temp: any = [];
      allKeyProps.map((item: string, index: number) => {
        if (allKeyProps.indexOf(item) == index) {
          temp.push(array[index])
        }
      })
      return temp
    }

    const cleanedShoeTitle = cleaning(shoeTitle, "title")
    // console.log("shoe title length : " + shoeTitle.length)
    // console.log("cleaned shoe title length : " + cleanedShoeTitle.length)

    // const onlyTitle = cleanedShoeTitle.map((item: any) => item.title)
    // return NextResponse.json({ onlyTitle, length: cleanedShoeTitle.length })
    console.log("/api/scrap : Completed!");

    res.send({ products: cleanedShoeTitle, length: cleanedShoeTitle.length })
  } catch (error) {
    console.error(error)
  }
  // res.send('Express + TypeScript Server');
});

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});
