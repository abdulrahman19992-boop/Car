// myFunctions.js - كل التوابع المطلوبة للموقع

// تحويل نص بصيغة yyyy-mm-dd إلى تاريخ، وترجع null إذا كان غير صحيح
function parseDate(str) {
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(str);
    if (m === null) {
        return null;
    }
    var y = parseInt(m[1], 10);
    var mo = parseInt(m[2], 10);
    var d = parseInt(m[3], 10);
    var dt = new Date(y, mo - 1, d);
    if (dt.getFullYear() !== y || dt.getMonth() !== mo - 1 || dt.getDate() !== d) {
        return null;
    }
    return dt;
}

function setError(id, msg) {
    $("#err-" + id).text(msg);
}

function clearErrors() {
    $("span.error").text("");
}

// التحقق من الحقول، وترجع true إذا كانت كلها صحيحة
function validateForm() {
    var ok = true;
    clearErrors();

    var name = $.trim($("#fullName").val());
    var nid = $.trim($("#nationalId").val());
    var start = $.trim($("#startDate").val());
    var end = $.trim($("#endDate").val());
    var mobile = $.trim($("#mobile").val());
    var email = $.trim($("#email").val());

    // الاسم (اختياري) أحرف عربية فقط
    if (name !== "") {
        if (!/^[ء-ي]+(\s+[ء-ي]+)*$/.test(name)) {
            setError("fullName", "الاسم يجب أن يحتوي أحرفاً عربية فقط");
            ok = false;
        }
    }

    // الرقم الوطني (إلزامي) 11 خانة وأول خانتين من 01 إلى 14
    if (nid === "") {
        setError("nationalId", "الرقم الوطني إلزامي");
        ok = false;
    } else if (!/^\d{11}$/.test(nid)) {
        setError("nationalId", "الرقم الوطني يجب أن يتكون من 11 رقماً");
        ok = false;
    } else {
        var gov = parseInt(nid.substring(0, 2), 10);
        if (gov < 1 || gov > 14) {
            setError("nationalId", "أول خانتين يجب أن تكونا بين 01 و 14");
            ok = false;
        }
    }

    // تاريخ البداية (إلزامي)
    var startDate = null;
    if (start === "") {
        setError("startDate", "تاريخ البداية إلزامي");
        ok = false;
    } else {
        startDate = parseDate(start);
        if (startDate === null) {
            setError("startDate", "التاريخ غير صحيح، الصيغة المطلوبة yyyy-mm-dd");
            ok = false;
        }
    }

    // تاريخ النهاية (إلزامي) ويجب أن يكون بعد البداية
    var endDate = null;
    if (end === "") {
        setError("endDate", "تاريخ النهاية إلزامي");
        ok = false;
    } else {
        endDate = parseDate(end);
        if (endDate === null) {
            setError("endDate", "التاريخ غير صحيح، الصيغة المطلوبة yyyy-mm-dd");
            ok = false;
        } else if (startDate !== null && endDate <= startDate) {
            setError("endDate", "تاريخ النهاية يجب أن يكون لاحقاً لتاريخ البداية");
            ok = false;
        }
    }

    // الموبايل (اختياري) MTN: 094 095 096 ، Syriatel: 093 098 099
    if (mobile !== "") {
        if (!/^09(3|4|5|6|8|9)\d{7}$/.test(mobile)) {
            setError("mobile", "الرقم يجب أن يكون لشبكة MTN أو Syriatel (10 أرقام تبدأ بـ 09)");
            ok = false;
        }
    }

    // البريد (اختياري)
    if (email !== "") {
        if (!/^[A-Za-z0-9._-]+@[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)+$/.test(email)) {
            setError("email", "البريد الإلكتروني غير صحيح");
            ok = false;
        }
    }

    return ok;
}

// حساب الفاتورة وعرض النتيجة
function showResult() {
    var start = parseDate($.trim($("#startDate").val()));
    var end = parseDate($.trim($("#endDate").val()));
    var days = Math.round((end - start) / 86400000);

    var lines = [];
    var total = 0;

    $("input.pick:checked").each(function () {
        var row = $(this).closest("tr");
        var code = row.find("td").eq(0).text();
        var model = row.find("td").eq(1).text();
        var price = parseInt(row.find("td").eq(3).text().replace(/\D/g, ""), 10);
        var cost = price * days;
        total += cost;
        lines.push(code + " - " + model + " : " + price + " ل.س × " + days + " يوم = " + cost + " ل.س");
    });

    var discountText = "لا يوجد خصم";
    var finalTotal = total;
    if (days > 10) {
        finalTotal = total - total * 0.05;
        discountText = "تم تطبيق خصم 5% لأن مدة التأجير أكثر من 10 أيام";
    }

    var msg = "تم استلام طلب الحجز بنجاح\n";
    msg += "عدد أيام التأجير: " + days + "\n";
    msg += "السيارات المختارة:\n" + lines.join("\n") + "\n";
    msg += "المجموع قبل الخصم: " + total + " ل.س\n";
    msg += discountText + "\n";
    msg += "المبلغ الإجمالي: " + finalTotal + " ل.س";

    var html = "<h2>تم استلام طلب الحجز بنجاح</h2>";
    html += "<p>عدد أيام التأجير: " + days + "</p>";
    html += "<p>السيارات المختارة:</p><ul>";
    for (var i = 0; i < lines.length; i++) {
        html += "<li>" + lines[i] + "</li>";
    }
    html += "</ul>";
    html += "<p>المجموع قبل الخصم: " + total + " ل.س</p>";
    html += "<p>" + discountText + "</p>";
    html += "<p><b>المبلغ الإجمالي: " + finalTotal + " ل.س</b></p>";

    $("#result").html(html).slideDown(400);
    alert(msg);
}

$(document).ready(function () {

    // ظهور المحتوى بتأثير بسيط في كل الصفحات
    $("#content").hide().fadeIn(700);

    // زر الخروج
    $("#exitLink").click(function () {
        return confirm("هل تريد الخروج من الموقع؟");
    });

    // إظهار / إخفاء تفاصيل السيارة
    $("input.show").click(function () {
        $("#d-" + $(this).val()).toggle(this.checked);
    });

    // تلوين صف السيارة المختارة
    $("input.pick").click(function () {
        $(this).closest("tr").toggleClass("selected", this.checked);
    });

    // زر متابعة
    $("#continueBtn").click(function () {
        if ($("input.pick:checked").length === 0) {
            alert("الرجاء اختيار سيارة واحدة على الأقل");
            return;
        }
        $("#formBox").slideDown(400);
        $("html, body").animate({ scrollTop: $("#formBox").offset().top }, 500);
    });

    // إرسال النموذج
    $("#rentForm").submit(function (e) {
        e.preventDefault();
        if ($("input.pick:checked").length === 0) {
            alert("الرجاء اختيار سيارة واحدة على الأقل");
            return;
        }
        if (validateForm()) {
            showResult();
        } else {
            $("#result").hide();
        }
    });

    // زر المسح
    $("#rentForm").bind("reset", function () {
        clearErrors();
        $("#result").hide();
    });
});
