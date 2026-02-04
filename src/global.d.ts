export {}; 
//이파일을 모듈로 만들어 전역 타입 확장이 올바르게 해줍니다

declare global{
    interface Window{
        daum:any;

    }
}
/*
            Postcode : new (options: {
                oncomplete: (data:any) => void;
            }) => { 
                open: () => void
            };
        };
*/