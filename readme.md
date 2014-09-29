jsfmt for sublime text
=================


If you want your javascript automatically formatted to abide a particular style, 
then jsfmt is for you.  No need to read warnings and fix things yourself. 
Just keep it all auto. Boom boom [jsfmt](https://github.com/rdio/jsfmt) is pretty tight. 
And yeah, if you want it in Sublime Text this is your homeboy.

![](http://i.imgur.com/zkBvQ6X.gif)

Save the file, it gets formatted.

### Installation

```bash

## go to your ST packages folder. maybe something like …
cd ~/Library/"Application Support/Sublime Text 2"/Packages

# clone this repo
git clone https://github.com/paulirish/sublime-jsfmt
```

This is very much NOT on package control because it its still a new thing. Try it out. 
If its working for you and you want to help run the show I'll transfer the repo to 
you and you can go to town. 

### Plugins included
- [esformatter-braces](https://github.com/pgilad/esformatter-braces)
- [esformatter-semicolons](https://github.com/bulyshko/esformatter-semicolons)
- [esformatter-dot-notation](https://github.com/pgilad/esformatter-dot-notation)
- [esformatter-quotes](https://github.com/millermedeiros/esformatter-quotes)

### Formatting rules

You can set global rules via a `.jsfmtrc`. Be crazy and establish one for all your 
projects in `~/.jsfmtrc`. (like in [my dotfiles](https://github.com/paulirish/dotfiles/blob/master/.jsfmtrc))

Otherwise you're probably pretty levelheaded and will probably provide one in your 
project root. It'll be read and applied.

Rules you can intuit from these [esformatter preset files](https://github.com/millermedeiros/esformatter/tree/master/lib/preset).

There's a `.jsfmtrc-sample` in this repo. It's a good start. Rename it and toss it 
somewhere. Try it out. 

#### compatibility 

should work in both ST2 and ST3.


### contributing

go wild. i'll add you as repo owner and/or transfer it to you. it's all <3


