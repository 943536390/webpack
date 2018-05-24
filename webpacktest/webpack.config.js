const path = require('path');
const uglify = require('uglifyjs-webpack-plugin');//js压缩插件
const htmlPlugin= require('html-webpack-plugin');//打包html
//const extractTextPlugin = require("extract-text-webpack-plugin");//css分离插件,依赖webpack3
const MiniCssExtractPlugin = require("mini-css-extract-plugin") //单独打包css，依赖webpack4

const glob = require('glob');//检查html模板
const PurifyCSSPlugin = require("purifycss-webpack");//消除未使用的CSS

const webpack = require('webpack');//使用webpack自带的插件，需要先引入webpack

const CleanWebpackPlugin = require('clean-webpack-plugin');//打包前先清空dist文件夹
//const copyWebpackPlugin= require("copy-webpack-plugin");//静态资源集中输出的插件

var website ={
    publicPath:"http://localhost:1717/"
}
module.exports={
    //入口文件的配置项
    entry:{
        //entrys: ['./src/entry.js', './src/entry2.js'], 
        entry: './src/entry.js',
        // entry2: './src/entry2.js',
        jquery:'jquery'//抽离第三方库
        // entry2: './src/entry2.js'
    },
    //出口文件的配置项
    output:{
            //打包的路径文职
            path:path.resolve(__dirname,'dist'),
            //打包的文件名称
            filename:'js/[name].js',
            publicPath:website.publicPath
    },
   
    //模块：例如解读CSS,图片如何转换，压缩
    module:{
        rules: [
            {
                test: /\.scss$/,
                //use: ['style-loader', 'css-loader']
                use: [MiniCssExtractPlugin.loader, "css-loader","sass-loader"]  // 从右向左解析

            },
            {
                test: /\.(png|jpg|gif)/,
                use: [
                    {
                        loader: 'url-loader',
                        options: {
                             limit:244,
                             outputPath:'images/',//将打包后的图片存在指定文件夹
                        }
                    }
                ]
            },

            //处理HTML中的图片
            {
                test: /\.(htm|html)$/i,
                use:[ 'html-withimg-loader'] 
            },

            //css文件打包
            {
                  test: /\.css$/,
                   use: [MiniCssExtractPlugin.loader, "css-loader","postcss-loader"]  //PostCSS处理属性前缀
            },

            //ES6转码
            {
                  test:/\.js$/,
                  use: 'babel-loader',
                  include: /src/,          // 只转化src目录下的js
                  exclude: /node_modules/  // 排除掉node_modules，优化打包速度
            },

            {
                test:/\.vue$/, 
                loader:'vue-loader'
            },

           

           
        ]
    },
     resolve: {
        extensions: ['.js', '.vue', '.css']
    },
    //插件，用于生产模版和各项功能
    plugins:[
       // new uglify() //使用js压缩插件,在生产模式下使用
       
       // 打包html
       new htmlPlugin({
            // minify:{
            //     removeAttributeQuotes:true
            // },
            // hash:true,
            template:'./src/index.html',
            filename: 'index.html',
            chunks: ['vendor','entry']   // 对应关系,login.js对应的是login.html
           
        }),
       // new htmlPlugin({
       //             template: './src/index2.html',
       //             filename: 'index2.html',
       //             chunks: ['entry2']   // 对应关系,login.js对应的是login.html
       //         }),

      

       //单独打包css文件
       //new extractTextPlugin("/css/index.css"),
       new MiniCssExtractPlugin({ 
            filename: "css/[name].css", 
            chunkFilename: "[id].css" 
        }) ,

       //消除未使用的CSS
       new PurifyCSSPlugin({
               // Give paths to parse for rules. These should be absolute!
               paths: glob.sync(path.join(__dirname, 'src/*.html')),
               }),

       //全局引入第三方包
       new webpack.ProvidePlugin({
               $:"jquery",

           }),

       //添加注释
       new webpack.BannerPlugin('JSPang版权所有，看官方免费视频到jspang.com收看'),
 
       // new copyWebpackPlugin([{
       //         from:__dirname+'/src/public',
       //         to:'./public'
       //     }]),
       
       // 打包前先清空
       new CleanWebpackPlugin('dist')  ,
       // 热更新，热更新不是刷新
       new webpack.HotModuleReplacementPlugin(),

       new webpack.LoaderOptionsPlugin({
            options: {
              babel:{
                  presets:['es2015'],
                  plugins:['transform-runtime']
              }
            }
        })




    ],

    //分离第三方包
    // optimization:{
    //     splitChunks:{
    //         cacheGroups:{ // 单独提取JS文件引入html
    //             jquery:{ // 键值可以自定义
    //                 chunks:'initial', // 
    //                 name:'jquery', // 入口的entry的key
    //                 enforce:true   // 强制 
    //             },
               
    //         }
    //     }
    // },
    
    // 提取公共代码
   optimization: {
        splitChunks: {
            cacheGroups: {
                vendor: {   // 抽离第三方插件
                    test: /node_modules/,   // 指定是node_modules下的第三方包
                    chunks: 'initial',
                    name: 'vendor',  // 打包后的文件名，任意命名    
                    // 设置优先级，防止和自定义的公共代码提取时被覆盖，不进行打包
                    priority: 10    
                },


            }
        }
  },


    //配置webpack开发服务功能
    devServer:{
            //设置基本目录结构
            contentBase:path.resolve(__dirname,'dist'),
            //服务器的IP地址，可以使用IP也可以使用localhost
            host:'localhost',
            //服务端压缩是否开启
            compress:true,
            //配置服务端口号
            port:1717,
            //open: true,             // 自动打开浏览器
            hot: true               // 开启热更新
        },

    //webpack --watch的配置
    watchOptions:{
        //检测修改的时间，以毫秒为单位
        poll:1000, 
        //防止重复保存而发生重复编译错误。这里设置的500是半秒内重复保存，不进行打包操作
        aggregateTimeout:500, 
        //不监听的目录
        ignored:/node_modules/, 
    }
}