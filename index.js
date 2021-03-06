$(function() {
    init();

    $('#text').click(function() {
        window.getSelection().selectAllChildren(this);
    });
});

const OPTION_TPL = '<option value="{$value}">{$name}</option>';
const A_TPL = '<a href="{$value}" target="_blank" rel="noreferrer">{$value}</a>';
let list;

function init() {
    let url = 'list.json';
    $.ajax({
        type: 'GET',
        url: url,
        dataType: 'json',
        async: true,
        success: function(result, textStatus, jqXHR) {
            $('#loading').hide();
            $('#select').show();
            list = result;
            drawDistribution();
        },
        error: function(msg) {
            let statusText = '<span  style="color: red">' + msg.statusText + '</snap>';
            $('#loading').append(statusText);
        },
    });
};

function drawDistribution() {
    let options = '<option value="">--Please choose an option--</option>';
    let distribution = $('#distribution').val();

    for (let distribution in list) {
        let value = distribution;
        let name = distribution;

        let option = OPTION_TPL;
        option = option.replace('{$value}', value);
        option = option.replace('{$name}', name);

        options = options + option;
    }

    $('#distribution').html(options);
    $('#distribution').on('change', function() {
        drawReleasever();
        drawSource(true);
    });
}

function drawReleasever() {
    let distribution = $('#distribution').val();
    if (!distribution) {
        return;
    }

    let options = '<option value="">--Please choose an option--</option>';
    for (let releasever in list[distribution]) {
        let value = releasever;
        let name = releasever;
        if (list[distribution][releasever].hasOwnProperty('name')) {
            name = name + '-' + list[distribution][releasever].name;
        }

        let option = OPTION_TPL;
        option = option.replace('{$value}', value);
        option = option.replace('{$name}', name);

        options = options + option;
    }

    $('#releasever').html(options);
    $('#releasever').on('change', function() {
        drawSource();
    });
}

function drawSource(clean = false) {
    if (clean) {
        let options = '<option value="">--Please choose an option--</option>';
        $('#source').html(options);
        return;
    }

    let distribution = $('#distribution').val();
    let releasever = $('#releasever').val();
    if (!releasever || !distribution) {
        return;
    }

    let options = '<option value="">--Please choose an option--</option>';

    if (!list.hasOwnProperty(distribution)) {
        console.log('e1');
        return;
    }
    if (!list[distribution].hasOwnProperty(releasever)) {
        console.log('e2');
        return;
    }

    for (let source in list[distribution][releasever].mirrors) {
        let value = source;
        let name = list[distribution][releasever].mirrors[source].name;

        let option = OPTION_TPL;
        option = option.replace('{$value}', value);
        option = option.replace('{$name}', name);

        options = options + option;
    }

    $('#source').html(options);
    $('#source').on('change', function() {
        showDown();
    });
}

function showDown() {
    let distribution = $('#distribution').val();
    let releasever = $('#releasever').val();
    let source = $('#source').val();

    if (!releasever || !distribution || !source) {
        return;
    }

    let obj = list[distribution][releasever].mirrors[source];

    let information = distribution + '-' + releasever + '-' + source;
    $('#information').html(information);

    let refer;


    if (obj.hasOwnProperty('refer')) {
        refer = A_TPL;
        refer = refer.split('{$value}').join(obj.refer);
    } else {
        refer = 'null';
    }
    $('#refer').html(refer);

    let url = './mirrors/' + distribution + '/' + obj.url;

    let uri = obj.uri;
    let raw = A_TPL;
    raw = raw.split('{$value}').join(uri);
    $('#raw').html(raw);

    let tips = 'Loading...';
    $('#text').html(tips);

    $.ajax({
        type: 'GET',
        url: url,
        dataType: 'text',
        async: true,
        success: function(result, textStatus, jqXHR) {
            let code = '<code id="code" class="lang-apacheconf">' + result + '</code>';
            $('#text').html(code);
            Prism.highlightAll();
        },
        error: function(msg) {
            let statusText = '<span  style="color: red">' + msg.statusText + '</snap>';
            $('#text').html(statusText);
        },
    });

};
