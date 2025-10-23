console.log('---------- Blog Entry Collector ----------')

import fs from 'fs/promises'
import path from 'path'
import axios from 'axios'
import * as cheerio from 'cheerio'

const url: string = 'https://blog.uint.dev'
const className: string = '.listing .card'
const postLimit: number = 5
const title: string = 'Recent posts'
const description: string = `More can be viewed <a href="${url}">here</a>.`

interface Post {
    link: string | undefined
    title: string
    description: string
    metadata: string
}

async function fetchData(url: string, className: string, postLimit: number) {
    try {
        const { data } = await axios.get(url)

        const $ = cheerio.load(data)
        const elements = $(`${className}`)

        elements.each((index, element) => {
            if (index >= postLimit) return

            let card = $(element)
            let link: string | undefined = card.attr('href')
            let title: string = card.find('.title').eq(0).text()
            let description: string = card.find('.description').eq(0).text()
            let metadata: string = card.find('.metadata').eq(0).text()

            console.log(`--- Index ${index} ---`)
            console.log(link)
            console.log(title)
            console.log(description)
            console.log(metadata)
            console.log(`----------------------`)

            let entryData = {
                link: link,
                title: title,
                description: description,
                metadata: metadata,
            }

            blogEntryObject.posts.push(entryData)
        })

        if (elements.length === 0) {
            console.log(`No elements found with class '${className}'`)
            process.exit(1)
        }
    } catch (error) {
        console.error('Error fetching or parsing the page:', error)
        process.exit(1)
    }
}

let blogEntryObject: {
    metadata: object
    posts: Post[]
} = {
    metadata: {
        title: title,
        description: description,
        base: url,
    },
    posts: [],
}

console.log('Stage 1: fetch blog posts')
await fetchData(url, className, postLimit)

console.log(blogEntryObject)

async function writeJsonToFile(
    directory: string,
    filename: string,
    data: object
) {
    try {
        await fs.mkdir(directory, { recursive: true })
        const filePath = path.join(directory, filename)

        console.log(`Writing to ${filePath}...`)
        await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8')

        console.log(`Successfully wrote to ${filePath}`)
    } catch (error) {
        console.error('Error writing to JSON file:', error)
        process.exit(1)
    }
}

const directory = './src/data'
const filename = 'blog.json'
const data = blogEntryObject

console.log('Stage 2: write blog posts to file')

await writeJsonToFile(directory, filename, data)

console.log('Done! Proceeding with actual build.')

console.log('------------------------------------------')
