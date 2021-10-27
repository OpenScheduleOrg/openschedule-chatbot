export function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

export function CPFormat(cpf: string) {
    if (cpf.match(/^\d{11}$/)) {
        return `${cpf.slice(0, 3)}.${cpf.slice(3, 6)}.${cpf.slice(
            6,
            9
        )}-${cpf.slice(9, 11)}`;
    }
    return cpf
}
