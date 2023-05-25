exports.getDate = function getDate(){
    const today = new Date();
    
    const options = {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric"
    };

    const day = today.toLocaleDateString("fr-FR", options);
    
    return day;
}