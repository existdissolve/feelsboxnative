export const groupFeels = (feels, opts = {}) => {
    const {filter = []} = opts;

    return feels.filter(feel => feel.active).reduce((groups, feel) => {
        const {categories = []} = feel;

        if (!categories.length) {
            if (filter.length) {
                return groups;
            }

            const categoryId = 'uncategorized';
            const categoryName = 'Uncategorized';
            const group = groups.find(item => item._id === categoryId);

            if (!group) {
                groups.push({
                    _id: categoryId,
                    name: categoryName,
                    data: [feel],
                    feels: [feel]
                });
            } else {
                group.data.push(feel);
                group.feels.push(feel);
            }
        } else {
            categories.forEach(category => {
                const {_id, name} = category;

                if (filter.length && !filter.includes(_id)) {
                    return false;
                }

                const group = groups.find(item => item._id === _id);

                if (!group) {
                    groups.push({
                        _id,
                        name,
                        data: [feel],
                        feels: [feel]
                    });
                } else {
                    group.data.push(feel);
                    group.feels.push(feel);
                }
            });
        }

        return groups.sort((prev, next) => {
            const {name: pn} = prev;
            const {name: nn} = next;

            return pn < nn ? -1 : pn > nn ? 1 : 0;
        });
    }, []);
};
