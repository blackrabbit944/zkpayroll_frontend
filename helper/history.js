
export const changeUrl = (type,one) => {

    switch(type) {
        case 'question':
            history.pushState({}, one.get('title'), "/q/"+one.get('question_id'));
            break;
        case 'share':
            history.pushState({}, one.get('title'), "/s/"+one.get('share_id'));
            break;
        case 'post':
            history.pushState({}, one.get('title'), "/p/"+one.get('post_id'));
            break;
    }
    
}