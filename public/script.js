lang = {
    "c": "C",
    "c99": "C-99",
    "cpp": "C++",
    "cpp14": "C++ 14",
    "cpp17": "C++ 17",
    "java": "Java",
    "php": "PHP",
    "perl": "Perl",
    "python3": "Python 3",
    "python2": "Python 2",
    "ruby": "Ruby",
    "go": "Go Lang",
    "scala": "Scala",
    "bash": "Bash Shell",
    "sql": "SQL",
    "pascal": "Pascal",
    "csharp": "C#",
    "vbn": "VB.Net",
    "haskell": "Haskel",
    "objc": "Objective C",
    "swfit": "Swift",
    "brainfuck": "Brainf**k",
    "rust": "RUST",
    "r": "R Language",
    "dart": "Dart",
    "nodejs": "NodeJS",
    "coffeescript": "CoffeeScript",
    "kotlin": "Kotlin"
}
mode = {

    "c": "clike",
    "c99": "clike",
    "cpp": "clike",
    "cpp14": "clike",
    "cpp17": "clike",
    "java": "clike",
    "php": "php",
    "perl": "perl",
    "python3": "python",
    "python2": "python",
    "ruby": "ruby",
    "go": "go",
    "scala": "clike",
    "bash": "shell",
    "sql": "sql",
    "pascal": "pascal",
    "csharp": "clike",
    "vbn": "clike",
    "haskell": "haskell",
    "objc": "clike",
    "swfit": "swift",
    "brainfuck": "brainfuck",
    "rust": "rust",
    "r": "r",
    "dart": "dart",
    "nodejs": "javascript",
    "coffeescript": "coffeescript",
    "kotlin": "clike",
}

theme = {
    "Ambiance": "ambiance",
    "Gruvbox-dark": "gruvbox-dark",
    "Darcula": "darcula",
    "Dracula": "dracula",
    "Base16 Dark": "base16-dark",
    "Eclipse": "eclipse",
    "Icecoder": "icecoder",
    "Lesser Dark": "lesser-dark",
    "Material Darker": "material-darker",
    "Material Palenight": "material-palenight",
    "Monokai": "monokai",
    "Neat": "neat",
    "Neo": "neo",
    "Nord": "nord",
    "Shadowfox": "shadowfox",
    "Ayu Mirage": "ayu-mirage",
    "Yonce": "yonce",
    "XQ Light": "xq-light",
    "Ambiance Mobile": "ambiance-mobile",
}

theIDE = {}

$(document).ready(() => {

    var codeArea = document.getElementById('code');

    theIDE = CodeMirror.fromTextArea(codeArea, {
        lineNumbers: true,
        styleActiveLine: true,
        mode: "clike",
        theme: 'ambiance',
        indentUnit: 4,
        smartIndent: true,
        indentWithTabs: true,
        matchBrackets: true,
        lineWrapping: true,
        foldGutter: true,
        gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"],
        extraKeys: {
            "Ctrl-Q": function (cm) {
                cm.foldCode(cm.getCursor());
            },
            "Ctrl-Space": "autocomplete",
            "Tab": "indentMore",
            "Shift-Tab": "indentLess",
            "F11": function (cm) {
                cm.setOption("fullScreen", !cm.getOption("fullScreen"));
            },
            "Esc": function (cm) {
                if (cm.getOption("fullScreen")) cm.setOption("fullScreen", false);
            },
            "F8": function (cm) {
                if (cm.getOption("fullScreen")) cm.setOption("fullScreen", false);
                Run();
            },
            "Ctrl-Y": cm => CodeMirror.commands.foldAll(cm),
            "Ctrl-I": cm => CodeMirror.commands.unfoldAll(cm),
            "Ctrl-/": cm => CodeMirror.commands.toggleComment(cm),
            "Ctrl+Shift-/": cm => CodeMirror.commands.toggleBlockComment(cm),

        }
    });

    theIDE.setSize(null, $(window).height() * .6);

    CodeMirror.commands.autocomplete = function (cm) {
        CodeMirror.showHint(cm, CodeMirror.hint.clike, {
            async: true
        });
    };

    let langTemplate = ""
    for (const key in lang) {
        langTemplate += `<option value="${key}">${lang[key]}</option>`
    }

    document.querySelector("#language").innerHTML = langTemplate

    let themeTemplate = ""

    for (const key in theme) {
        themeTemplate += `<option value="${key}">${theme[key]}</option>`
    }

    document.querySelector("#theme").innerHTML = themeTemplate
    modeChanged()
    fontSizeChanged()
    tabSizeChanged()
    let mode_ = document.getElementById("mode_").innerText.trim()

    if (mode_ != '') {

        document.getElementById('language').value = mode_;

        // theIDE.setOption("mode", mode_)

        let code_ = document.getElementById("code_").innerText

        theIDE.setOption("value", code_)

        document.title = "Compaile " + lang[mode_] + " Online"

        document.getElementById('ide-title').innerHTML = document.title

        let input_ = document.getElementById("input_").innerText

        document.getElementById('input').value = input_
    }
    document.querySelector('#run').addEventListener('click', Run)
    document.querySelector('#save').addEventListener('click', Save)
})

async function Run() {

    if (!navigator.onLine) {
        document.querySelector("#output").innerText = "Error, no Internet Connection. Try again later."
        return
    }
    document.querySelector("#output").innerText = "Working..."


    let inputObject = {
        "language": document.getElementById('language').value,
        "input": document.getElementById('input').value,
        "code": theIDE.getValue()
    }

    document.getElementById('run').disabled = true;


    let options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(inputObject)

    }
    fetch('/running', options).then(async (result) => {
        const data = await result.json()
        document.querySelector('#output').value = await data.output
        document.querySelector("#cpuTime").innerText = await data.cpuTime
        document.querySelector("#memory").innerText = await data.memory
        document.querySelector("#statusCode").innerText = await data.statusCode
        $('html, body').animate({
            scrollTop: $("#output").offset().top
        }, 500);

    }).catch((err) => {
        document.querySelector('#output').value = "Error() unable to run your code please try later."
    }).then((nor) => {
        NormalizeRunButton()
    })

}

async function Save() {

    if (!navigator.onLine) {
        document.querySelector("#output").innerText = "Error, no Internet Connection. Try again later."
    }

    if (theIDE.getValue().trim() === "") {
        document.querySelector("#output").innerText = "Error, can't save Empty File. Try again."
        return
    }
    document.querySelector("#output").innerText = "Preserving you code ..."

    let saveObject = {
        "language": document.getElementById('language').value,
        "input": document.getElementById('input').value,
        "code": theIDE.getValue(),
        _id: getId()
    }

    document.getElementById('save').disabled = true;


    let options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(saveObject)
    }

    fetch('/save', options).then(async (result) => {
        NormalizeSaveButton()
        if (await result)
            window.location.href = `/${saveObject._id}`
    }).catch((err) => {
        document.querySelector("#output").innerText = "error in saving your code try again later"
    })

}

function NormalizeRunButton() {
    document.getElementById('run').disabled = false;
}

function NormalizeSaveButton() {
    document.getElementById('save').disabled = false;
    document.querySelector("#output").innerText = ''
}


function show_input() {
    var show = document.getElementById("showinput");
    var hide = document.getElementById("hideinput");
    var input_field = document.getElementById("input");
    show.style.display = 'none';
    hide.style.display = 'inline';
    input_field.style.display = 'block';
}

function hide_input() {
    var show = document.getElementById("showinput");
    var hide = document.getElementById("hideinput");
    var input_field = document.getElementById("input");
    show.style.display = 'inline';
    hide.style.display = 'none';
    input_field.style.display = 'none';
}

function getDefaultCode(val) {
    switch (val) {
        case 'c':
            return `//c GCC 5.3.0\n\n#include <stdio.h>\n\nint main()\n{\n\tprintf("Hello, world!\\n");\n}`;
        case 'c99':
            return `//c99 GCC 5.3.0\n\n#include <stdio.h>\n\nint main()\n{\n\tprintf("Hello, world!\\n");\n}`;
        case 'cpp':
            return `//g++  GCC 5.3.0\n\n#include <bits/stdc++.h>\nusing namespace std;\n\nint main()\n{\n\tcout<<"Hello, world!";\n}`;
        case 'cpp14':
            return `//g++14 GCC 5.3.0\n\n#include <bits/stdc++.h>\nusing namespace std;\n\nint main()\n{\n\tcout<<"Hello, world!";\n}`;
        case 'cpp17':
            return `//g++ 17 GCC 9.10\n\n#include <bits/stdc++.h>\nusing namespace std;\n\nint main()\n{\n\tcout<<"Hello, world!";\n}`;
        case 'java':
            return `\nimport java.util.*;\nimport java.lang.*;\n\npublic class Main {\n\tpublic static void main(String args[]) {\n\n\t\tSystem.out.println("Hello, world!");\n\n\t}\n}`;
        case 'php':
            return `<?php //php 5.6.16\n\n\techo "Hello, world!"\n\n?>`;
        case 'perl':
            return `#perl 5.22.0 \n\nprint "Hello World!";`;
        case 'python2':
            return `#Python 2.7.11\n\nprint "Hello, world!"`;
        case 'python3':
            return `#Python 3.5.1\n\nprint ("Hello, world!")`;
        case 'r':
            return `#R version 3.3.1\n\nprint ("Hello, world!")`;
        case 'rust':
            return `//rust 1.10.0\n\nfn main() {\n\tprintln!("Hello, world!");\n}`;
        case 'go':
            return `//go 1.5.2\n\npackage main\nimport "fmt"\n\nfunc main() {\n\tfmt.Printf("hello, world\")\n}`;
        case 'csharp':
            return `//C# mono 4.2.2\n\nusing System;\n\nclass Program\n{\n\n\tstatic void Main() {\n\n\t\tConsole.Write("Hello, world!");\n\n\t}\n}\n`
        case 'ruby':
            return `#ruby 2.2.4 \n\nputs "Hello, world!"`;
        case 'scala':
            return `//Scala 2.12.0 \n\nobject IDESeven {\n\tdef main(args: Array[String]) = {\n\t\tprintln("Hello, world!")\n\t}\n}`
        case 'bash':
            return `#!/bin/bash\n# GNU bash, version 4.3.42\n\necho "Hello, world!";`
        case 'kotlin':
            return `//Kotlin 1.1.51 (JRE 9.0.1+11)\n\nfun main(args: Array<String>) {\n\tprintln("Hello, world!")\n}`
        case 'coffeescript':
            return `# Coffee Script 1.11.1\n\nconsole.log("Hello, world!")`
        case 'nodejs':
            return `// NodeJs 6.3.1\n\nconsole.log("Hello, world!")`
        case 'dart':
            return `//Dart 1.18.0\n\nvoid main() {\n\tprint('Hello, World!');\n}`
        case 'brainfuck':
            return `[/*bfc-0.1*/]  \n\n>++++++++[<+++++++++>-]<.>++++[<+++++++>-]<+.+++++++..+++.>>++++++[<+++++++>-]<+\n+.------------.>++++++[<+++++++++>-]<+.<.+++.------.--------.>>>++++[<++++++++>-\n]<+.`
        case 'swfit':
            return `// Swfit 2.2\n\nprint("Hello, World!")`
        case 'vbn':
            return `Imports System\n\nPublic Class Test\n\tPublic Shared Sub Main()\n\t\tSystem.Console.WriteLine("Hello World!")\n\tEnd Sub\nEnd Class`
        case 'objc':
            return `//Objective-C GCC 5.3.0\n\n#import <Foundation/Foundation.h>\n\nint main (int argc, const char * argv[])\n{\n\tNSAutoreleasePool *pool = [[NSAutoreleasePool alloc] init];\n\tNSLog (@"Hello, World!");\n\t[pool drain];\n\treturn 0;\n}`
        case 'haskell':
            return `--ghc 7.10.3 \n\nmain = print $ "Hello, world!"`
        case 'pascal':
            return `//fpc 3.0.4\n\nprogram HelloWorld;\n\nbegin\n\twriteln('Hello, world!');\nend.`
        case 'sql':
            return `--  SQLite 3.9.2\n\nselect 'Hello World!';`
        default:
            return `//your code gose here`;
    }
}

function modeChanged() {
    var mode_el = document.getElementById("language")

    var smode = mode_el.options[mode_el.selectedIndex].value
    theIDE.setOption("mode", mode[smode])
    theIDE.setOption("value", getDefaultCode(smode))
    document.title = "Compaile " + lang[smode] + " Online"

    document.getElementById('ide-title').innerHTML = document.title
}

function themeChanged() {
    var theme_el = document.getElementById("theme")
    var stheme = theme_el.options[theme_el.selectedIndex].textContent
    theIDE.setOption("theme", stheme)
}

function tabSizeChanged() {
    var tab_el = document.getElementById("tabSize").value
    theIDE.setOption("tabSize", tab_el)
}

function fontSizeChanged() {
    var font_el = document.getElementById("fontSize")
    var sfsize = font_el.options[font_el.selectedIndex].value
    $('.CodeMirror').css("font-size", sfsize);

}

let getId = () => {
    return Math.random().toString(36).substr(2, 7)
}
