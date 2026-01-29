const STOP_WORDS = new Set(["the", "and", "for", "with", "that", "this",
    "from", "your", "you", "are", "have", "has",
    "was", "were", "will", "about", "into", "I", "a", "an", "in", "on", "at", "to", "is", "it", "of", "or", "as", "by", "be", "not", "but", "if", "they", "we", "he", "she", "his", "her", "my", "me", "so", "no", "do", "does", "did"
]);

exports.extractKeywords = (text = "") =>     {
    return text
    .toLowerCase()
    .split(/\W+/)
    .filter(word => !STOP_WORDS.has(word) && word.length > 3);
};
